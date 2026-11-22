"""Pure, stateless Python NLP utilities for mono-magic."""

from __future__ import annotations

from py_utils_nlp.cleaning import clean_text
from py_utils_nlp.keywords import (
    DEFAULT_STOPWORDS,
    ScoredKeyword,
    extract_keywords_textrank,
    extract_keywords_tfidf,
    extract_keywords_yake,
    plural_to_singular,
    singular_to_plural,
)
from py_utils_nlp.masking import mask_keyword_in_sentence
from py_utils_nlp.segmentation import (
    sentences_per_paragraph,
    split_paragraphs,
    split_sentences,
)
from py_utils_nlp.similarity import SimilarityMatch, cosine_similarity, top_k_similar

__all__ = [
    "DEFAULT_STOPWORDS",
    "ScoredKeyword",
    "SimilarityMatch",
    "clean_text",
    "cosine_similarity",
    "extract_keywords_textrank",
    "extract_keywords_tfidf",
    "extract_keywords_yake",
    "mask_keyword_in_sentence",
    "plural_to_singular",
    "sentences_per_paragraph",
    "singular_to_plural",
    "split_paragraphs",
    "split_sentences",
    "top_k_similar",
]
