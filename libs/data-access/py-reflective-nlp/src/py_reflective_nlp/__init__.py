"""Contract-first Python data-access and NLP/LLM orchestration providers for Reflective Learning."""

from __future__ import annotations

from .grading import DeterministicHashEmbeddingBackend, FastEmbedSemanticGrader
from .llm_generator import (
    CHAPTER_PROMPT_TEMPLATE,
    HybridKeywordExtractor,
    TemplateLLMQuestionGenerator,
)
from .protocols import (
    ContentSourceProvider,
    DocumentParserAdapter,
    EmbeddingBackend,
    KeywordExtractor,
    LLMQuestionGenerator,
    SemanticGrader,
    StructuredLLMClient,
)
from .repository import SqliteReflectiveRepository
from .schemas import (
    BloomLevel,
    ChapterQuestionBundle,
    ContentSourceRequest,
    DistractorChoice,
    GradeBand,
    IngestionStatus,
    KeywordDTO,
    MCQQuestionDTO,
    ParagraphDTO,
    SmartMCQItem,
    SmartSubjectiveItem,
    SourceKind,
    SubjectiveGradeResult,
    SubjectiveQuestionDTO,
    TopicSummaryDTO,
)
from .sources import (
    ContentSourceRegistry,
    DefaultDocumentParserAdapter,
    DocumentBookSource,
    MarkdownTextSource,
    WikipediaApiSource,
)

__all__ = [
    "CHAPTER_PROMPT_TEMPLATE",
    "BloomLevel",
    "ChapterQuestionBundle",
    "ContentSourceProvider",
    "ContentSourceRegistry",
    "ContentSourceRequest",
    "DefaultDocumentParserAdapter",
    "DeterministicHashEmbeddingBackend",
    "DistractorChoice",
    "DocumentBookSource",
    "DocumentParserAdapter",
    "EmbeddingBackend",
    "FastEmbedSemanticGrader",
    "GradeBand",
    "HybridKeywordExtractor",
    "IngestionStatus",
    "KeywordDTO",
    "KeywordExtractor",
    "LLMQuestionGenerator",
    "MCQQuestionDTO",
    "MarkdownTextSource",
    "ParagraphDTO",
    "SemanticGrader",
    "SmartMCQItem",
    "SmartSubjectiveItem",
    "SourceKind",
    "SqliteReflectiveRepository",
    "StructuredLLMClient",
    "SubjectiveGradeResult",
    "SubjectiveQuestionDTO",
    "TemplateLLMQuestionGenerator",
    "TopicSummaryDTO",
    "WikipediaApiSource",
]
