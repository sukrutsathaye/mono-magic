# `py-utils-nlp` (`libs/utils/py-nlp`)

> Pure, stateless Python NLP text-processing utilities for `mono-magic`: text cleaning, paragraph and sentence segmentation, English morphological normalization, algorithmic keyword extraction (**TF-IDF**, **TextRank**, **YAKE**), boundary-safe keyword masking, and cosine vector similarity.

- **Nx Project**: `py-utils-nlp`
- **Tags**: `scope:utils`, `type:util`, `lang:py`
- **Python Package**: `py-utils-nlp` (import path `py_utils_nlp`, PEP 561 `py.typed`, **zero external runtime dependencies**)

---

## Official Documentation, Libraries & Algorithm References

| Algorithm / Technology | Reference | Where It Is Used Here |
| :--- | :--- | :--- |
| **TF-IDF** | [Term Frequency–Inverse Document Frequency](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) | `keywords.extract_keywords_tfidf` — statistical term weighting across paragraphs. |
| **TextRank** | [Mihalcea & Tarau (EMNLP 2004) — TextRank Paper](https://aclanthology.org/W04-3252/) | `keywords.extract_keywords_textrank` — graph-based PageRank keyword scoring over co-occurrence windows. |
| **YAKE!** | [Campos et al. — YAKE Unsupervised Keyword Extraction](https://github.com/LIAAD/yake) | `keywords.extract_keywords_yake` — lightweight statistical feature scoring (casing, position, frequency, relatedness). |
| **Cosine Similarity** | [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity) | `similarity.cosine_similarity` & `top_k_similar` — dense embedding comparison for semantic grading. |
| **spaCy** *(Downstream companion)* | [spaCy Documentation](https://spacy.io/usage) | Used in downstream `py-reflective-nlp` alongside these pure stdlib helpers for NER/POS pipelines. |
| **Python `uv` & Ruff / Pyright** | [uv Docs](https://docs.astral.sh/uv/) · [Ruff Docs](https://docs.astral.sh/ruff/) | Workspace dependency management, linting, formatting, and strict type checking. |

---

## Public API Catalog

| Module | Exported Symbols | Description |
| :--- | :--- | :--- |
| `cleaning` | `clean_text` | Normalizes whitespace, citations, and Unicode punctuation deterministically. |
| `segmentation` | `split_paragraphs`, `split_sentences`, `sentences_per_paragraph` | Splits raw passages into paragraphs and abbreviation-aware sentences. |
| `keywords` | `DEFAULT_STOPWORDS`, `ScoredKeyword`, `plural_to_singular`, `singular_to_plural`, `extract_keywords_tfidf`, `extract_keywords_textrank`, `extract_keywords_yake` | Morphological normalization and multi-algorithm unsupervised keyword extraction. |
| `masking` | `mask_keyword_in_sentence` | Word-boundary-safe cloze/blank masking for fill-in-the-blank & MCQ generation. |
| `similarity` | `SimilarityMatch`, `cosine_similarity`, `top_k_similar` | Pure-Python vector similarity and ranked top-$k$ retrieval. |

## Nx Targets & Quality Gates

```bash
uv sync --all-packages
pnpm nx run-many -t lint typecheck test -p py-utils-nlp
```

- `pnpm nx lint py-utils-nlp` — `ruff check` and `ruff format --check`
- `pnpm nx typecheck py-utils-nlp` — strict `pyright` verification
- `pnpm nx test py-utils-nlp` — `pytest --cov` (`>=90%` coverage gate)

---

<!-- COVERAGE_TABLE_START -->
## Test & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever new functions or unit tests are written.

| Project | Runner | Lines | Statements | Functions | Branches | Threshold | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `py-utils-nlp` | Pytest (`pytest --cov`) | **90.0%** | **90.0%** | **90.0%** | **90.0%** | `>= 90%` | Passing |
<!-- COVERAGE_TABLE_END -->
