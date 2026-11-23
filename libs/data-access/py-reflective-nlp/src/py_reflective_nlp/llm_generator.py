"""LLMQuestionGenerator implementation with injectable LLM client and deterministic NLP fallback."""

from __future__ import annotations

from collections.abc import Sequence

from py_data_access_interfaces import DataAccessError, Err, ErrorCode, Result, err, ok
from py_utils_nlp import (
    extract_keywords_textrank,
    extract_keywords_tfidf,
    extract_keywords_yake,
    mask_keyword_in_sentence,
    split_sentences,
)

from .protocols import StructuredLLMClient
from .schemas import (
    BloomLevel,
    ChapterQuestionBundle,
    DistractorChoice,
    KeywordDTO,
    ParagraphDTO,
    SmartMCQItem,
    SmartSubjectiveItem,
)

CHAPTER_PROMPT_TEMPLATE = """
You are an instructional designer creating reflective-learning assessments.
Given a chapter of paragraphs on "{topic}", generate:
1. Key canonical concepts (normalize plurals/partial names).
2. Up to {max_mcqs} high-quality MCQs (self-contained stems; 3 plausible
   same-category distractors with misconception notes).
3. Up to {max_subjective} open-ended reflective questions ("How", "Why",
   "Compare", "What") with a concise model answer and rubric key points.
Strictly ground every fact in the provided paragraphs.

CHAPTER PARAGRAPHS:
{paragraphs_block}
""".strip()

_FALLBACK_DISTRACTOR_POOL: tuple[str, ...] = (
    "thermodynamic equilibrium",
    "quantum superposition",
    "electromagnetic induction",
    "gravitational lensing",
)


class HybridKeywordExtractor:
    """Combines YAKE, TextRank, and TF-IDF from ``py_utils_nlp`` into ``KeywordDTO``s."""

    def __init__(self, top_k_per_paragraph: int = 5) -> None:
        """Initialize with maximum keywords extracted per paragraph."""
        self._top_k = max(1, top_k_per_paragraph)

    async def extract(
        self,
        paragraphs: Sequence[ParagraphDTO],
    ) -> Result[list[KeywordDTO], DataAccessError]:
        """Extract canonical keywords aligned with paragraph indices."""
        if not paragraphs:
            return ok([])

        corpus = [p.text for p in paragraphs]
        tfidf_scores = {
            kw.term.lower(): kw.score
            for kw in extract_keywords_tfidf(corpus, top_k=self._top_k * 3)
        }

        by_term: dict[str, tuple[list[int], int]] = {}
        for para in paragraphs:
            yake_terms = [kw.term for kw in extract_keywords_yake(para.text, top_k=self._top_k)]
            tr_terms = [kw.term for kw in extract_keywords_textrank(para.text, top_k=self._top_k)]
            combined = list(dict.fromkeys([*yake_terms, *tr_terms]))
            for raw_term in combined:
                term = raw_term.strip().lower()
                if not term:
                    continue
                count_in_para = max(1, para.text.lower().count(term))
                if term not in by_term:
                    by_term[term] = ([para.index], count_in_para)
                else:
                    indices, freq = by_term[term]
                    if para.index not in indices:
                        indices.append(para.index)
                    by_term[term] = (indices, freq + count_in_para)

        results: list[KeywordDTO] = []
        for term, (indices, freq) in sorted(
            by_term.items(),
            key=lambda item: (item[1][1], tfidf_scores.get(item[0], 0.0)),
            reverse=True,
        ):
            words = term.split()
            is_person = len(words) >= 2 and any(
                term in p.text.lower() and term.title() in p.text for p in paragraphs
            )
            if is_person:
                pos_pattern = "PROPN PROPN"
            elif len(words) > 1:
                pos_pattern = "NOUN PHRASE"
            else:
                pos_pattern = "NOUN"
            results.append(
                KeywordDTO(
                    term=term,
                    paragraph_indices=indices,
                    is_person=is_person,
                    pos_pattern=pos_pattern,
                    frequency=freq,
                )
            )
        return ok(results)


class TemplateLLMQuestionGenerator:
    """Provider-agnostic ``LLMQuestionGenerator`` with injectable client and fallback."""

    def __init__(
        self,
        llm_client: StructuredLLMClient | None = None,
        *,
        model: str = "gemini-2.5-flash",
    ) -> None:
        """Initialize with an optional ``StructuredLLMClient`` and target model identifier."""
        self._client = llm_client
        self._model = model
        self._extractor = HybridKeywordExtractor(top_k_per_paragraph=4)

    @staticmethod
    def build_prompt(
        topic: str,
        chapter_paragraphs: Sequence[ParagraphDTO],
        *,
        max_mcqs: int = 8,
        max_subjective: int = 3,
    ) -> str:
        """Render the structured chapter assessment prompt."""
        paragraphs_block = "\n\n".join(
            f"[P{p.index} | {p.heading or 'Body'}] {p.text}" for p in chapter_paragraphs
        )
        return CHAPTER_PROMPT_TEMPLATE.format(
            topic=topic.strip(),
            max_mcqs=max_mcqs,
            max_subjective=max_subjective,
            paragraphs_block=paragraphs_block,
        )

    async def _generate_deterministic_fallback(
        self,
        topic: str,
        chapter_paragraphs: Sequence[ParagraphDTO],
        *,
        max_mcqs: int,
        max_subjective: int,
    ) -> Result[ChapterQuestionBundle, DataAccessError]:
        kw_res = await self._extractor.extract(chapter_paragraphs)
        if isinstance(kw_res, Err):
            return err(kw_res.error)

        keywords = kw_res.value
        concepts = [k.term for k in keywords[: max(max_mcqs, max_subjective, 4)]]
        if not concepts:
            concepts = [topic.strip().lower()]

        para_by_idx = {p.index: p for p in chapter_paragraphs}
        mcqs: list[SmartMCQItem] = []

        for kw in keywords:
            if len(mcqs) >= max_mcqs:
                break
            p_idx = kw.paragraph_indices[0] if kw.paragraph_indices else chapter_paragraphs[0].index
            para = para_by_idx.get(p_idx, chapter_paragraphs[0])
            sentences = split_sentences(para.text)
            target_sent = next(
                (s for s in sentences if kw.term.lower() in s.lower()),
                sentences[0] if sentences else para.text,
            )
            masked = mask_keyword_in_sentence(target_sent, kw.term)
            if "____" not in masked:
                masked = f"In the context of {topic}, which concept best fits: {target_sent} (____)"

            candidate_terms = [c for c in concepts if c != kw.term]
            for fallback_term in _FALLBACK_DISTRACTOR_POOL:
                if len(candidate_terms) >= 3:
                    break
                if fallback_term != kw.term and fallback_term not in candidate_terms:
                    candidate_terms.append(fallback_term)

            distractors = [
                DistractorChoice(
                    text=term,
                    misconception_note=(
                        f"Learners often confuse {term!r} with {kw.term!r} within {topic}."
                    ),
                )
                for term in candidate_terms[:3]
            ]

            mcqs.append(
                SmartMCQItem(
                    paragraph_index=para.index,
                    concept=kw.term,
                    bloom_level=BloomLevel.UNDERSTAND,
                    question_stem=masked,
                    correct_answer=kw.term,
                    distractors=distractors,
                    explanation=f"{kw.term!r} is directly established in paragraph {para.index}.",
                )
            )

        subjective: list[SmartSubjectiveItem] = []
        for kw in keywords[:max_subjective]:
            matching_sentences: list[str] = []
            for p_idx in kw.paragraph_indices:
                para = para_by_idx.get(p_idx)
                if para is None:
                    continue
                for sent in split_sentences(para.text):
                    if kw.term.lower() in sent.lower() and sent not in matching_sentences:
                        matching_sentences.append(sent)
            if not matching_sentences:
                matching_sentences = [chapter_paragraphs[0].text]

            interrogative = "Who is" if kw.is_person else "What is"
            model_answer = " ".join(matching_sentences[:2])
            rubric_points = [
                f"Defines {kw.term} in the context of {topic}.",
                f"Explains the role of {kw.term}: {matching_sentences[0][:80]}",
            ]
            if len(matching_sentences) > 1:
                rubric_points.append(f"Connects to: {matching_sentences[1][:80]}")

            subjective.append(
                SmartSubjectiveItem(
                    concept=kw.term,
                    bloom_level=BloomLevel.UNDERSTAND,
                    prompt=f"{interrogative} {kw.term} and how does it relate to {topic}?",
                    model_answer=model_answer,
                    rubric_key_points=rubric_points[:5],
                )
            )

        return ok(
            ChapterQuestionBundle(
                concepts=concepts,
                mcqs=mcqs,
                subjective_questions=subjective,
            )
        )

    async def generate_for_chapter(
        self,
        topic: str,
        chapter_paragraphs: Sequence[ParagraphDTO],
        *,
        max_mcqs: int = 8,
        max_subjective: int = 3,
    ) -> Result[ChapterQuestionBundle, DataAccessError]:
        """Generate a ``ChapterQuestionBundle`` using the LLM client or deterministic fallback."""
        if not topic.strip():
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message="Topic title must not be empty.",
                    provider="llm_question_generator",
                )
            )
        if not chapter_paragraphs:
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message="chapter_paragraphs must not be empty.",
                    provider="llm_question_generator",
                )
            )

        if self._client is not None:
            prompt = self.build_prompt(
                topic,
                chapter_paragraphs,
                max_mcqs=max_mcqs,
                max_subjective=max_subjective,
            )
            try:
                raw_json = await self._client.generate_structured_json(
                    prompt,
                    model=self._model,
                )
                bundle = ChapterQuestionBundle.model_validate_json(raw_json)
                return ok(bundle)
            except Exception as exc:
                return err(
                    DataAccessError(
                        code=ErrorCode.UNAVAILABLE,
                        message=f"LLM structured question generation failed: {exc}",
                        retryable=True,
                        provider="llm_question_generator",
                        cause=str(exc),
                    )
                )

        return await self._generate_deterministic_fallback(
            topic,
            chapter_paragraphs,
            max_mcqs=max_mcqs,
            max_subjective=max_subjective,
        )
