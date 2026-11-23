"""Domain DTOs and Pydantic v2 schemas for Reflective Learning data-access and NLP."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


class SourceKind(StrEnum):
    """Supported content ingestion source types."""

    WIKIPEDIA = "wikipedia"
    RAW_TEXT = "raw_text"
    MARKDOWN = "markdown"
    PDF = "pdf"
    EPUB = "epub"


class IngestionStatus(StrEnum):
    """Topic ingestion lifecycle status."""

    PENDING = "pending"
    SCRAPING = "scraping"
    EXTRACTING = "extracting"
    GENERATING = "generating"
    READY = "ready"
    FAILED = "failed"


class GradeBand(StrEnum):
    """Semantic similarity grading band for open-ended subjective answers."""

    CORRECT = "correct"
    LIKELY_CORRECT = "likely_ok"
    LIKELY_WRONG = "likely_wrong"
    WRONG = "wrong"


class BloomLevel(StrEnum):
    """Bloom's taxonomy cognitive level for generated questions."""

    RECALL = "recall"
    UNDERSTAND = "understand"
    APPLY = "apply"


class ParagraphDTO(BaseModel):
    """Normalized paragraph chapter segment extracted from a content source."""

    model_config = ConfigDict(frozen=True)

    index: int = Field(..., ge=0, description="Zero-based paragraph index.")
    heading: str | None = Field(default=None, description="Section heading if present.")
    text: str = Field(..., min_length=1, description="Cleaned paragraph text.")


class ContentSourceRequest(BaseModel):
    """Input descriptor for ingesting content via a ``ContentSourceProvider``."""

    model_config = ConfigDict(frozen=True)

    kind: SourceKind = Field(..., description="Content source category.")
    title: str = Field(..., min_length=1, description="Human-readable topic title.")
    query_or_uri: str | None = Field(
        default=None,
        description="Optional Wikipedia article title or remote/local document URI.",
    )
    raw_content: str | None = Field(
        default=None,
        description="Inline raw text or Markdown content.",
    )
    content_bytes: bytes | None = Field(
        default=None,
        description="Optional raw binary payload for PDF or EPUB documents.",
    )
    min_paragraph_length: int = Field(
        default=40,
        ge=1,
        description="Minimum character length for retained paragraphs.",
    )


class KeywordDTO(BaseModel):
    """Extracted domain keyword or concept candidate."""

    model_config = ConfigDict(frozen=True)

    id: UUID = Field(default_factory=uuid4, description="Unique keyword identifier.")
    term: str = Field(..., min_length=1, description="Canonical keyword term.")
    paragraph_indices: list[int] = Field(
        default_factory=list[int],
        description="Indices of paragraphs containing this keyword.",
    )
    is_person: bool = Field(default=False, description="Whether the term refers to a person.")
    pos_pattern: str = Field(default="NOUN", description="Part-of-speech pattern label.")
    frequency: int = Field(default=1, ge=1, description="Occurrence count across the topic.")
    approved: bool | None = Field(
        default=None,
        description="Teacher curation decision (None=pending, True=approved, False=rejected).",
    )


class MCQQuestionDTO(BaseModel):
    """Multiple-choice fill-in-the-blank or conceptual question DTO."""

    model_config = ConfigDict(frozen=True)

    id: UUID = Field(default_factory=uuid4, description="Unique question identifier.")
    paragraph_index: int = Field(..., ge=0, description="Source paragraph index.")
    keyword: str = Field(..., min_length=1, description="Target keyword tested.")
    prompt: str = Field(..., min_length=1, description="Question stem or blanked sentence.")
    correct_answer: str = Field(..., min_length=1, description="Canonical correct option.")
    distractors: list[str] = Field(
        ...,
        min_length=3,
        max_length=3,
        description="Three plausible distractor options.",
    )
    approved: bool = Field(default=True, description="Whether the question is approved.")


class SubjectiveQuestionDTO(BaseModel):
    """Open-ended subjective definition or conceptual question DTO."""

    model_config = ConfigDict(frozen=True)

    id: UUID = Field(default_factory=uuid4, description="Unique subjective question ID.")
    keyword: str = Field(..., min_length=1, description="Target concept or keyword.")
    prompt: str = Field(..., min_length=1, description="Open-ended question prompt.")
    reference_sentences: list[str] = Field(
        ...,
        min_length=1,
        description="Reference sentences forming the model definition.",
    )
    approved: bool = Field(default=True, description="Whether approved by a teacher.")


class SubjectiveGradeResult(BaseModel):
    """Semantic similarity grading output for a subjective question response."""

    model_config = ConfigDict(frozen=True)

    question_id: UUID = Field(..., description="Graded question identifier.")
    similarity_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Cosine similarity score in [0.0, 1.0].",
    )
    band: GradeBand = Field(..., description="Categorized grade band.")
    feedback: str | None = Field(
        default=None,
        description="Actionable rubric or semantic match feedback.",
    )
    reference_answer: str = Field(..., description="Joined reference definition.")


class DistractorChoice(BaseModel):
    """Plausible MCQ distractor paired with a diagnostic misconception note."""

    model_config = ConfigDict(frozen=True)

    text: str = Field(..., min_length=1, description="Distractor choice text.")
    misconception_note: str = Field(
        ...,
        min_length=1,
        description="1-sentence explanation of why learners confuse this option with the answer.",
    )


class SmartMCQItem(BaseModel):
    """LLM-generated or enriched multiple-choice question with misconception diagnostics."""

    model_config = ConfigDict(frozen=True)

    paragraph_index: int = Field(..., ge=0, description="Source paragraph index.")
    concept: str = Field(..., min_length=1, description="Canonical concept tested.")
    bloom_level: BloomLevel = Field(default=BloomLevel.UNDERSTAND, description="Bloom level.")
    question_stem: str = Field(..., min_length=1, description="Self-contained question stem.")
    correct_answer: str = Field(..., min_length=1, description="Correct answer text.")
    distractors: list[DistractorChoice] = Field(
        ...,
        min_length=3,
        max_length=3,
        description="Three diagnostic distractors.",
    )
    explanation: str = Field(..., min_length=1, description="Concept explanation.")


class SmartSubjectiveItem(BaseModel):
    """Rubric-backed open-ended reflective question."""

    model_config = ConfigDict(frozen=True)

    concept: str = Field(..., min_length=1, description="Target concept.")
    bloom_level: BloomLevel = Field(default=BloomLevel.UNDERSTAND, description="Bloom level.")
    prompt: str = Field(..., min_length=1, description="Open-ended reflective prompt.")
    model_answer: str = Field(..., min_length=1, description="Concise model answer.")
    rubric_key_points: list[str] = Field(
        ...,
        min_length=2,
        max_length=5,
        description="Key rubric points expected in a complete response.",
    )


class ChapterQuestionBundle(BaseModel):
    """Chapter-level assessment bundle produced by ``LLMQuestionGenerator``."""

    model_config = ConfigDict(frozen=True)

    concepts: list[str] = Field(
        default_factory=list[str],
        description="Canonical chapter concepts.",
    )
    mcqs: list[SmartMCQItem] = Field(
        default_factory=list[SmartMCQItem],
        description="Generated MCQ items.",
    )
    subjective_questions: list[SmartSubjectiveItem] = Field(
        default_factory=list[SmartSubjectiveItem],
        description="Generated subjective items.",
    )


class TopicSummaryDTO(BaseModel):
    """Persisted reflective learning topic entity."""

    model_config = ConfigDict(frozen=True)

    id: str = Field(..., min_length=1, description="Unique topic identifier.")
    title: str = Field(..., min_length=1, description="Topic display title.")
    slug: str = Field(..., min_length=1, description="URL-safe topic slug.")
    source_kind: SourceKind = Field(default=SourceKind.WIKIPEDIA, description="Source kind.")
    paragraph_count: int = Field(default=0, ge=0, description="Total paragraphs.")
    keyword_count: int = Field(default=0, ge=0, description="Total keywords.")
    approved_keyword_count: int = Field(default=0, ge=0, description="Approved keywords.")
    status: IngestionStatus = Field(default=IngestionStatus.PENDING, description="Status.")
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(tz=UTC),
        description="Last update timestamp.",
    )
