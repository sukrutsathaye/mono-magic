# `py-utils-nlp` (`libs/utils/py-nlp`)

Pure, stateless Python NLP text-processing utilities for `mono-magic`: text cleaning, paragraph and sentence segmentation, English morphological normalization, algorithmic keyword extraction (TF-IDF, TextRank, YAKE), boundary-safe keyword masking, and cosine vector similarity.

## Architecture & Boundaries

- **Nx Project**: `py-utils-nlp`
- **Tags**: `scope:utils`, `type:util`, `lang:py`
- **Python Package**: `py-utils-nlp` (import path `py_utils_nlp`, PEP 561 `py.typed`)
- **Zero External Runtime Dependencies**: Pure Python standard library, stateless, and free of HTTP/DB/SDK state.

## Modules

- `cleaning`: `clean_text`
- `segmentation`: `split_paragraphs`, `split_sentences`, `sentences_per_paragraph`
- `keywords`: `DEFAULT_STOPWORDS`, `ScoredKeyword`, `plural_to_singular`, `singular_to_plural`, `extract_keywords_tfidf`, `extract_keywords_textrank`, `extract_keywords_yake`
- `masking`: `mask_keyword_in_sentence`
- `similarity`: `SimilarityMatch`, `cosine_similarity`, `top_k_similar`

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
