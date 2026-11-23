# `py-reflective-nlp` (`libs/data-access/py-reflective-nlp`)

Contract-first Python (`>=3.12`, `uv`) data-access and NLP/LLM orchestration library for the **Reflective Learning** platform.

## Architecture & Capabilities

- **`ContentSourceProvider` Protocol & Implementations**:
  - `WikipediaApiSource`: Async MediaWiki Action API extractor using `httpx.AsyncClient` (with injectable client support).
  - `MarkdownTextSource`: Heading-aware (`#`, `##`, `###`) raw text and Markdown paragraph parser powered by `py_utils_nlp`.
  - `DocumentBookSource`: Async PDF and EPUB chapter extractor accepting a pluggable `DocumentParserAdapter` offloaded via `asyncio.to_thread`.
- **`SemanticGrader` Protocol & `FastEmbedSemanticGrader`**:
  - Two-tier semantic similarity grading with canonical bands (`correct`, `likely_ok`, `likely_wrong`, `wrong`).
  - Accepts an injectable `EmbeddingBackend` (defaulting to a deterministic lexical/n-gram embedding backend for offline unit testing, or `fastembed.TextEmbedding` in production).
- **`LLMQuestionGenerator` Protocol & `TemplateLLMQuestionGenerator`**:
  - Generates structured `ChapterQuestionBundle` payloads (`SmartMCQItem` with `DistractorChoice` misconception notes, `SmartSubjectiveItem` with `BloomLevel` and rubric key points) via an injectable `StructuredLLMClient` with a deterministic NLP fallback powered by `py_utils_nlp`.
- **`SqliteReflectiveRepository`**:
  - Async SQLite (`sqlite3` + `asyncio.to_thread`) generic repository implementing `DataRepository[TEntity, TId]` from `py-data-access-interfaces` and passing `assert_repository_contract`.

## Nx Targets

```bash
pnpm nx lint py-reflective-nlp
pnpm nx typecheck py-reflective-nlp
pnpm nx test py-reflective-nlp
```
