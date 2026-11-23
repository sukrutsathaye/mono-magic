"""Unit and contract compliance tests for py-reflective-nlp."""

from __future__ import annotations

from collections.abc import Sequence
from pathlib import Path
from uuid import uuid4

import httpx
import pytest
from py_data_access_interfaces import (
    ErrorCode,
    FilterOperator,
    FilterSpec,
    QuerySpec,
    SortDirection,
    SortSpec,
    is_err,
    is_ok,
)
from py_data_access_interfaces.testing import assert_repository_contract
from py_reflective_nlp import (
    BloomLevel,
    ChapterQuestionBundle,
    ContentSourceProvider,
    ContentSourceRegistry,
    ContentSourceRequest,
    DeterministicHashEmbeddingBackend,
    DistractorChoice,
    DocumentBookSource,
    FastEmbedSemanticGrader,
    GradeBand,
    HybridKeywordExtractor,
    IngestionStatus,
    LLMQuestionGenerator,
    MarkdownTextSource,
    ParagraphDTO,
    SemanticGrader,
    SmartMCQItem,
    SmartSubjectiveItem,
    SourceKind,
    SqliteReflectiveRepository,
    SubjectiveQuestionDTO,
    TemplateLLMQuestionGenerator,
    TopicSummaryDTO,
    WikipediaApiSource,
)


def _mock_wiki_transport(status_code: int, json_payload: dict[str, object]) -> httpx.MockTransport:
    def _handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(status_code=status_code, json=json_payload, request=request)

    return httpx.MockTransport(_handler)


@pytest.mark.asyncio
async def test_wikipedia_api_source_success_and_headings() -> None:
    extract_text = (
        "A black hole[1] is a region of spacetime where gravity is so strong "
        "that nothing, including light or other electromagnetic waves, has enough energy "
        "to escape its event horizon.\n\n"
        "== Formation and Evolution ==\n"
        "Short line.\n"
        "Black holes of stellar mass form when massive stars collapse at the end of their "
        "life cycle in a supernova explosion.[citation needed]"
    )
    transport = _mock_wiki_transport(
        200,
        {
            "query": {
                "pages": [
                    {
                        "pageid": 123,
                        "title": "Black hole",
                        "extract": extract_text,
                    }
                ]
            }
        },
    )
    async with httpx.AsyncClient(transport=transport) as client:
        source = WikipediaApiSource(client)
        assert isinstance(source, ContentSourceProvider)
        res = await source.fetch_paragraphs(
            ContentSourceRequest(
                kind=SourceKind.WIKIPEDIA,
                title="Black Hole",
                min_paragraph_length=50,
            )
        )
        assert is_ok(res)
        paras = res.unwrap()
        assert len(paras) == 2
        assert paras[0].heading == "Introduction"
        assert "[1]" not in paras[0].text
        assert paras[1].heading == "Formation and Evolution"
        assert "[citation needed]" not in paras[1].text


@pytest.mark.asyncio
async def test_wikipedia_api_source_error_handling() -> None:
    # 1. Wrong source kind
    source = WikipediaApiSource()
    wrong_kind = await source.fetch_paragraphs(
        ContentSourceRequest(kind=SourceKind.MARKDOWN, title="Black Hole")
    )
    assert is_err(wrong_kind)
    assert wrong_kind.error.code == ErrorCode.VALIDATION

    # 2. Missing page
    missing_transport = _mock_wiki_transport(
        200,
        {"query": {"pages": [{"title": "NonExistentTopicXYZ", "missing": True}]}},
    )
    async with httpx.AsyncClient(transport=missing_transport) as client:
        res_missing = await WikipediaApiSource(client).fetch_paragraphs(
            ContentSourceRequest(kind=SourceKind.WIKIPEDIA, title="NonExistentTopicXYZ")
        )
        assert is_err(res_missing)
        assert res_missing.error.code == ErrorCode.NOT_FOUND

    # 3. Rate limited (429) & server error (503)
    rate_transport = _mock_wiki_transport(429, {})
    async with httpx.AsyncClient(transport=rate_transport) as client:
        res_429 = await WikipediaApiSource(client).fetch_paragraphs(
            ContentSourceRequest(kind=SourceKind.WIKIPEDIA, title="Black Hole")
        )
        assert is_err(res_429)
        assert res_429.error.code == ErrorCode.RATE_LIMITED

    err_503_transport = _mock_wiki_transport(503, {})
    async with httpx.AsyncClient(transport=err_503_transport) as client:
        res_503 = await WikipediaApiSource(client).fetch_paragraphs(
            ContentSourceRequest(kind=SourceKind.WIKIPEDIA, title="Black Hole")
        )
        assert is_err(res_503)
        assert res_503.error.code == ErrorCode.UNAVAILABLE

    # 4. Timeout exception
    def _timeout_handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("Timed out", request=request)

    async with httpx.AsyncClient(transport=httpx.MockTransport(_timeout_handler)) as client:
        res_timeout = await WikipediaApiSource(client).fetch_paragraphs(
            ContentSourceRequest(kind=SourceKind.WIKIPEDIA, title="Black Hole")
        )
        assert is_err(res_timeout)
        assert res_timeout.error.code == ErrorCode.TIMEOUT


@pytest.mark.asyncio
async def test_markdown_text_source_and_document_book_source(tmp_path: Path) -> None:
    md_source = MarkdownTextSource()
    assert isinstance(md_source, ContentSourceProvider)

    md_content = (
        "# General Relativity\n\n"
        "General relativity is the geometric theory of gravitation published by Albert Einstein "
        "in 1915 and is the current description of gravitation in modern physics.\n\n"
        "## Spacetime Curvature\n\n"
        "Spacetime curvature relates directly to the energy and momentum of whatever matter "
        "and radiation are present in the universe."
    )
    res_md = await md_source.fetch_paragraphs(
        ContentSourceRequest(
            kind=SourceKind.MARKDOWN,
            title="Relativity",
            raw_content=md_content,
            min_paragraph_length=40,
        )
    )
    assert is_ok(res_md)
    paras = res_md.unwrap()
    assert len(paras) == 2
    assert paras[0].heading == "General Relativity"
    assert paras[1].heading == "Spacetime Curvature"

    # File-based Markdown loading
    md_file = tmp_path / "notes.md"
    md_file.write_text(md_content, encoding="utf-8")
    res_file = await md_source.fetch_paragraphs(
        ContentSourceRequest(
            kind=SourceKind.RAW_TEXT,
            title="Notes",
            query_or_uri=str(md_file),
            min_paragraph_length=40,
        )
    )
    assert is_ok(res_file)
    assert len(res_file.unwrap()) == 2

    # Missing file & invalid kind
    res_missing = await md_source.fetch_paragraphs(
        ContentSourceRequest(
            kind=SourceKind.RAW_TEXT,
            title="Missing",
            query_or_uri=str(tmp_path / "does-not-exist.md"),
        )
    )
    assert is_err(res_missing)
    assert res_missing.error.code == ErrorCode.NOT_FOUND

    # DocumentBookSource (PDF / EPUB)
    book_source = DocumentBookSource()
    assert isinstance(book_source, ContentSourceProvider)
    pdf_bytes = (
        b"# Chapter 1: Thermodynamics\n\n"
        b"Thermodynamics is a branch of physics that deals with heat, work, and temperature, "
        b"and their relation to energy, entropy, and the physical properties of matter."
    )
    res_pdf = await book_source.fetch_paragraphs(
        ContentSourceRequest(
            kind=SourceKind.PDF,
            title="Physics Book",
            content_bytes=pdf_bytes,
            min_paragraph_length=40,
        )
    )
    assert is_ok(res_pdf)
    pdf_paras = res_pdf.unwrap()
    assert len(pdf_paras) == 1
    assert pdf_paras[0].heading == "Chapter 1: Thermodynamics"

    # Registry dispatch
    registry = ContentSourceRegistry([md_source, book_source])
    reg_ok = await registry.fetch_paragraphs(
        ContentSourceRequest(
            kind=SourceKind.EPUB,
            title="EPUB Book",
            content_bytes=pdf_bytes,
            min_paragraph_length=40,
        )
    )
    assert is_ok(reg_ok)

    reg_unregistered = await registry.fetch_paragraphs(
        ContentSourceRequest(kind=SourceKind.WIKIPEDIA, title="Black Hole")
    )
    assert is_err(reg_unregistered)
    assert reg_unregistered.error.code == ErrorCode.VALIDATION


@pytest.mark.asyncio
async def test_fastembed_semantic_grader_and_bands() -> None:
    backend = DeterministicHashEmbeddingBackend(dimensions=128)
    grader = FastEmbedSemanticGrader(embedding_backend=backend)
    assert isinstance(grader, SemanticGrader)
    assert grader.model_name == "BAAI/bge-small-en-v1.5"

    question = SubjectiveQuestionDTO(
        id=uuid4(),
        keyword="black hole",
        prompt="What is a black hole?",
        reference_sentences=[
            "A black hole is a region of spacetime where gravity is so strong "
            "that nothing can escape."
        ],
    )

    # Exact match -> CORRECT
    exact_res = await grader.grade(
        question,
        "A black hole is a region of spacetime where gravity is so strong that nothing can escape.",
    )
    assert is_ok(exact_res)
    assert exact_res.unwrap().band == GradeBand.CORRECT
    assert exact_res.unwrap().similarity_score >= 0.75

    # Unrelated answer -> WRONG or LIKELY_WRONG
    unrelated_res = await grader.grade(
        question,
        "Knitting with merino wool requires circular needles and careful stitch gauge.",
    )
    assert is_ok(unrelated_res)
    assert unrelated_res.unwrap().band in (GradeBand.WRONG, GradeBand.LIKELY_WRONG)

    # Empty answer -> VALIDATION error
    empty_res = await grader.grade(question, "   ")
    assert is_err(empty_res)
    assert empty_res.error.code == ErrorCode.VALIDATION

    # Band classification thresholds
    assert FastEmbedSemanticGrader.classify_band(0.80) == GradeBand.CORRECT
    assert FastEmbedSemanticGrader.classify_band(0.55) == GradeBand.LIKELY_CORRECT
    assert FastEmbedSemanticGrader.classify_band(0.25) == GradeBand.LIKELY_WRONG
    assert FastEmbedSemanticGrader.classify_band(0.10) == GradeBand.WRONG


class _FakeStructuredLLMClient:
    def __init__(self, should_fail: bool = False) -> None:
        self._should_fail = should_fail

    async def generate_structured_json(self, prompt: str, *, model: str) -> str:
        if self._should_fail:
            raise RuntimeError("Upstream LLM timeout")
        assert "Black Hole" in prompt
        assert model == "gemini-2.5-flash"
        bundle = ChapterQuestionBundle(
            concepts=["event horizon", "spacetime"],
            mcqs=[
                SmartMCQItem(
                    paragraph_index=0,
                    concept="event horizon",
                    bloom_level=BloomLevel.UNDERSTAND,
                    question_stem=(
                        "Which boundary marks the point of no return around a black hole?"
                    ),
                    correct_answer="event horizon",
                    distractors=[
                        DistractorChoice(
                            text="photon sphere",
                            misconception_note=(
                                "Light orbits at the photon sphere but can still escape."
                            ),
                        ),
                        DistractorChoice(
                            text="accretion disk",
                            misconception_note="The accretion disk is external orbiting plasma.",
                        ),
                        DistractorChoice(
                            text="ergosphere",
                            misconception_note="Energy can be extracted from the ergosphere.",
                        ),
                    ],
                    explanation="The event horizon is the causal boundary.",
                )
            ],
            subjective_questions=[
                SmartSubjectiveItem(
                    concept="event horizon",
                    bloom_level=BloomLevel.UNDERSTAND,
                    prompt="Why can light not escape from inside the event horizon?",
                    model_answer="All future-directed light cones inside the horizon point inward.",
                    rubric_key_points=[
                        "Mentions spacetime curvature or escape velocity exceeding c.",
                        "Explains that causal paths lead toward the singularity.",
                    ],
                )
            ],
        )
        return bundle.model_dump_json()


@pytest.mark.asyncio
async def test_llm_question_generator_fallback_and_client() -> None:
    paragraphs: Sequence[ParagraphDTO] = [
        ParagraphDTO(
            index=0,
            heading="Introduction",
            text=(
                "Albert Einstein formulated general relativity showing that a black hole "
                "warps spacetime so strongly that even light cannot escape the event horizon."
            ),
        ),
        ParagraphDTO(
            index=1,
            heading="Quantum Effects",
            text=(
                "Stephen Hawking demonstrated that quantum effects near the event horizon "
                "cause black holes to emit thermal Hawking radiation over astronomical timescales."
            ),
        ),
    ]

    # 1. Deterministic fallback (no external LLM client)
    fallback_gen = TemplateLLMQuestionGenerator()
    assert isinstance(fallback_gen, LLMQuestionGenerator)
    res_fb = await fallback_gen.generate_for_chapter(
        "Black Hole",
        paragraphs,
        max_mcqs=4,
        max_subjective=2,
    )
    assert is_ok(res_fb)
    bundle_fb = res_fb.unwrap()
    assert len(bundle_fb.concepts) >= 1
    assert len(bundle_fb.mcqs) >= 1
    assert len(bundle_fb.mcqs[0].distractors) == 3
    assert len(bundle_fb.subjective_questions) >= 1

    # 2. Structured LLM client
    llm_gen = TemplateLLMQuestionGenerator(llm_client=_FakeStructuredLLMClient())
    res_llm = await llm_gen.generate_for_chapter("Black Hole", paragraphs)
    assert is_ok(res_llm)
    assert res_llm.unwrap().mcqs[0].concept == "event horizon"

    # 3. Failing LLM client returns Err(UNAVAILABLE)
    failing_gen = TemplateLLMQuestionGenerator(
        llm_client=_FakeStructuredLLMClient(should_fail=True)
    )
    res_fail = await failing_gen.generate_for_chapter("Black Hole", paragraphs)
    assert is_err(res_fail)
    assert res_fail.error.code == ErrorCode.UNAVAILABLE

    # 4. Validation errors
    res_empty_topic = await fallback_gen.generate_for_chapter("  ", paragraphs)
    assert is_err(res_empty_topic)
    assert res_empty_topic.error.code == ErrorCode.VALIDATION

    res_empty_paras = await fallback_gen.generate_for_chapter("Black Hole", [])
    assert is_err(res_empty_paras)
    assert res_empty_paras.error.code == ErrorCode.VALIDATION

    # 5. HybridKeywordExtractor standalone check
    extractor = HybridKeywordExtractor(top_k_per_paragraph=3)
    kw_res = await extractor.extract(paragraphs)
    assert is_ok(kw_res)
    assert len(kw_res.unwrap()) >= 1


@pytest.mark.asyncio
async def test_sqlite_reflective_repository_contract_and_filters() -> None:
    def _factory() -> SqliteReflectiveRepository[TopicSummaryDTO, str]:
        return SqliteReflectiveRepository(
            TopicSummaryDTO,
            database=":memory:",
            table_name="topics",
        )

    await assert_repository_contract(
        _factory,
        make_entity=lambda idx: TopicSummaryDTO(
            id=f"topic-{idx}",
            title=f"Topic {idx}",
            slug=f"topic-{idx}",
            source_kind=SourceKind.WIKIPEDIA,
            paragraph_count=idx * 10,
            keyword_count=idx * 5,
            approved_keyword_count=idx * 2,
            status=IngestionStatus.READY,
        ),
        get_id=lambda entity: entity.id,
        make_patch=lambda entity: {
            "title": f"{entity.title} (Curated)",
            "approved_keyword_count": entity.approved_keyword_count + 1,
        },
        missing_id="topic-missing-999",
        verify_patched=lambda updated: updated.title.endswith("(Curated)"),
    )

    # Exercise advanced query operators (EQ, NEQ, IN, GT, GTE, LT, LTE, CONTAINS) and sorting
    repo = _factory()
    for i in range(1, 5):
        await repo.create(
            TopicSummaryDTO(
                id=f"t-{i}",
                title=f"Astrophysics Part {i}",
                slug=f"astrophysics-{i}",
                paragraph_count=i * 10,
                keyword_count=i * 4,
                approved_keyword_count=i,
                status=IngestionStatus.READY if i % 2 == 0 else IngestionStatus.PENDING,
            )
        )

    filtered = await repo.find_many(
        QuerySpec(
            filters=[
                FilterSpec(field="status", operator=FilterOperator.EQ, value=IngestionStatus.READY),
                FilterSpec(field="paragraph_count", operator=FilterOperator.GTE, value=20),
                FilterSpec(field="paragraph_count", operator=FilterOperator.LTE, value=40),
                FilterSpec(field="title", operator=FilterOperator.CONTAINS, value="astrophysics"),
                FilterSpec(field="id", operator=FilterOperator.IN, value=["t-2", "t-4"]),
                FilterSpec(field="slug", operator=FilterOperator.NEQ, value="astrophysics-1"),
            ],
            sorts=[SortSpec(field="paragraph_count", direction=SortDirection.DESC)],
        )
    )
    assert is_ok(filtered)
    items = filtered.unwrap().items
    assert [item.id for item in items] == ["t-4", "t-2"]

    await repo.close()
