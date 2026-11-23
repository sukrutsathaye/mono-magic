"""Structural Protocols for Reflective Learning content sources, grading, and LLM generation."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Protocol, runtime_checkable

from py_data_access_interfaces import DataAccessError, Result

from .schemas import (
    ChapterQuestionBundle,
    ContentSourceRequest,
    KeywordDTO,
    ParagraphDTO,
    SourceKind,
    SubjectiveGradeResult,
    SubjectiveQuestionDTO,
)


@runtime_checkable
class ContentSourceProvider(Protocol):
    """Open/Closed ingestion strategy supporting Wikipedia, Raw Text/Markdown, and PDF/EPUB."""

    @property
    def supported_kinds(self) -> tuple[SourceKind, ...]:
        """Return the ``SourceKind`` variants handled by this provider."""
        ...

    async def fetch_paragraphs(
        self,
        source: ContentSourceRequest,
    ) -> Result[list[ParagraphDTO], DataAccessError]:
        """Extract cleaned, section-tagged paragraphs from ``source``."""
        ...


@runtime_checkable
class DocumentParserAdapter(Protocol):
    """Pluggable binary document parser for PDF and EPUB books."""

    def extract_sections(
        self,
        kind: SourceKind,
        payload: bytes,
    ) -> list[tuple[str | None, str]]:
        """Parse binary document bytes into ``(heading, section_text)`` pairs."""
        ...


@runtime_checkable
class EmbeddingBackend(Protocol):
    """Injectable sentence embedding backend (ONNX ``fastembed`` or deterministic offline model)."""

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        """Compute embedding vectors for each text in ``texts``."""
        ...


@runtime_checkable
class SemanticGrader(Protocol):
    """Protocol for semantic evaluation of open-ended student responses."""

    async def grade(
        self,
        question: SubjectiveQuestionDTO,
        user_answer: str,
    ) -> Result[SubjectiveGradeResult, DataAccessError]:
        """Score ``user_answer`` against ``question.reference_sentences``."""
        ...


@runtime_checkable
class KeywordExtractor(Protocol):
    """Protocol for multi-algorithm or LLM keyword extraction across topic paragraphs."""

    async def extract(
        self,
        paragraphs: Sequence[ParagraphDTO],
    ) -> Result[list[KeywordDTO], DataAccessError]:
        """Extract canonical keywords aligned with paragraph indices."""
        ...


@runtime_checkable
class StructuredLLMClient(Protocol):
    """Injectable async LLM client returning JSON or structured ``ChapterQuestionBundle`` text."""

    async def generate_structured_json(
        self,
        prompt: str,
        *,
        model: str,
    ) -> str:
        """Execute ``prompt`` against ``model`` and return a JSON string matching the schema."""
        ...


@runtime_checkable
class LLMQuestionGenerator(Protocol):
    """Protocol for chapter-batched conceptual MCQ and subjective question generation."""

    async def generate_for_chapter(
        self,
        topic: str,
        chapter_paragraphs: Sequence[ParagraphDTO],
        *,
        max_mcqs: int = 8,
        max_subjective: int = 3,
    ) -> Result[ChapterQuestionBundle, DataAccessError]:
        """Generate a ``ChapterQuestionBundle`` grounded in ``chapter_paragraphs``."""
        ...
