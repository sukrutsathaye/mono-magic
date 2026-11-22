"""Unit tests for py_utils_nlp.keywords."""

from __future__ import annotations

import pytest
from py_utils_nlp import (
    DEFAULT_STOPWORDS,
    ScoredKeyword,
    extract_keywords_textrank,
    extract_keywords_tfidf,
    extract_keywords_yake,
    plural_to_singular,
    singular_to_plural,
)


@pytest.mark.parametrize(
    ("plural", "expected"),
    [
        ("children", "child"),
        ("Children", "Child"),
        ("MICE", "MOUSE"),
        ("studies", "study"),
        ("knives", "knife"),
        ("leaves", "leaf"),
        ("boxes", "box"),
        ("watches", "watch"),
        ("classes", "class"),
        ("cats", "cat"),
        ("sheep", "sheep"),
        ("status", "status"),
        ("is", "is"),
    ],
)
def test_plural_to_singular(plural: str, expected: str) -> None:
    assert plural_to_singular(plural) == expected


@pytest.mark.parametrize(
    ("singular", "expected"),
    [
        ("child", "children"),
        ("Child", "Children"),
        ("MOUSE", "MICE"),
        ("study", "studies"),
        ("knife", "knives"),
        ("leaf", "leaves"),
        ("box", "boxes"),
        ("watch", "watches"),
        ("cat", "cats"),
        ("sheep", "sheep"),
        ("", ""),
    ],
)
def test_singular_to_plural(singular: str, expected: str) -> None:
    assert singular_to_plural(singular) == expected


def test_default_stopwords_is_immutable() -> None:
    assert isinstance(DEFAULT_STOPWORDS, frozenset)
    assert "the" in DEFAULT_STOPWORDS


def test_extract_keywords_tfidf_ranks_distinctive_terms() -> None:
    docs = [
        "Neural networks learn hierarchical representations from training data.",
        "Quantum computing leverages qubits and superposition for quantum algorithms.",
        "Photosynthesis in chloroplasts converts sunlight into glucose.",
    ]
    results = extract_keywords_tfidf(docs, top_k=5)
    assert len(results) == 5
    assert all(isinstance(item, ScoredKeyword) for item in results)
    terms = {item.term for item in results}
    assert "quantum" in terms
    # Scores are strictly sorted descending.
    scores = [item.score for item in results]
    assert scores == sorted(scores, reverse=True)
    # Frequency for "quantum" is accurately counted as 2.
    quantum_item = next(item for item in results if item.term == "quantum")
    assert quantum_item.frequency == 2


def test_extract_keywords_tfidf_edge_cases() -> None:
    assert extract_keywords_tfidf([], top_k=5) == ()
    assert extract_keywords_tfidf(["the and of"], top_k=5) == ()
    assert extract_keywords_tfidf(["python rust"], top_k=0) == ()
    assert len(extract_keywords_tfidf(["python rust"], top_k=5, stopwords={"python"})) == 1
    with pytest.raises(ValueError, match="non-negative"):
        extract_keywords_tfidf(["hello"], top_k=-1)


def test_extract_keywords_textrank_cooccurrence_graph() -> None:
    text = (
        "Spaced repetition strengthens long-term memory retention. "
        "Active recall paired with spaced repetition improves memory recall "
        "and accelerates learning efficiency over time."
    )
    results = extract_keywords_textrank(text, top_k=5, window_size=4)
    assert len(results) == 5
    top_terms = {item.term for item in results}
    assert "memory" in top_terms or "repetition" in top_terms
    scores = [item.score for item in results]
    assert scores == sorted(scores, reverse=True)


def test_extract_keywords_textrank_validation_and_empty() -> None:
    assert extract_keywords_textrank("", top_k=5) == ()
    assert extract_keywords_textrank("the and of", top_k=5) == ()
    assert extract_keywords_textrank("alpha beta", top_k=0) == ()

    with pytest.raises(ValueError, match="top_k"):
        extract_keywords_textrank("alpha", top_k=-1)
    with pytest.raises(ValueError, match="window_size"):
        extract_keywords_textrank("alpha", window_size=1)
    with pytest.raises(ValueError, match="damping"):
        extract_keywords_textrank("alpha", damping=1.0)
    with pytest.raises(ValueError, match="max_iter"):
        extract_keywords_textrank("alpha", max_iter=0)


def test_extract_keywords_yake_scores_phrases_best_first() -> None:
    text = (
        "Reflective Learning uses Active Recall to strengthen knowledge retention. "
        "Active Recall encourages learners to retrieve concepts from memory. "
        "Combining Active Recall with spaced intervals boosts long-term retention."
    )
    results = extract_keywords_yake(text, top_k=6, max_ngram=2)
    assert len(results) == 6
    scores = [item.score for item in results]
    assert scores == sorted(scores, reverse=True)
    assert all(0.0 < s <= 1.0 for s in scores)
    terms = {item.term for item in results}
    assert "active recall" in terms or "recall" in terms


def test_extract_keywords_yake_validation_and_empty() -> None:
    assert extract_keywords_yake("", top_k=5) == ()
    assert extract_keywords_yake("   ", top_k=5) == ()
    assert extract_keywords_yake("alpha beta", top_k=0) == ()
    assert extract_keywords_yake("123 456", top_k=5) == ()

    with pytest.raises(ValueError, match="top_k"):
        extract_keywords_yake("alpha", top_k=-1)
    with pytest.raises(ValueError, match="max_ngram"):
        extract_keywords_yake("alpha", max_ngram=0)
