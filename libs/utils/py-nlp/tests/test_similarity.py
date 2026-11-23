"""Unit tests for py_utils_nlp.similarity."""

from __future__ import annotations

import math

import pytest
from py_utils_nlp import SimilarityMatch, cosine_similarity, top_k_similar


def test_cosine_similarity_known_vectors() -> None:
    assert math.isclose(cosine_similarity([1.0, 0.0], [1.0, 0.0]), 1.0)
    assert math.isclose(cosine_similarity([1.0, 0.0], [0.0, 1.0]), 0.0)
    assert math.isclose(cosine_similarity([1.0, 0.0], [-1.0, 0.0]), -1.0)
    assert cosine_similarity([0.0, 0.0], [1.0, 2.0]) == 0.0
    assert cosine_similarity([1.0, 2.0], [0.0, 0.0]) == 0.0


def test_cosine_similarity_validates_inputs() -> None:
    with pytest.raises(ValueError, match="non-empty"):
        cosine_similarity([], [])
    with pytest.raises(ValueError, match="mismatch"):
        cosine_similarity([1.0, 2.0], [1.0])


def test_top_k_similar_orders_descending_with_stable_tiebreak() -> None:
    query = [1.0, 0.0]
    candidates = [
        [0.0, 1.0],
        [1.0, 0.0],
        [-1.0, 0.0],
        [2.0, 0.0],
        [0.5, 0.5],
    ]
    matches = top_k_similar(query, candidates, k=3)
    assert len(matches) == 3
    assert matches[0] == SimilarityMatch(index=1, score=1.0)
    assert matches[1] == SimilarityMatch(index=3, score=1.0)
    assert matches[2].index == 4
    assert math.isclose(matches[2].score, math.sqrt(0.5))


def test_top_k_similar_edge_cases() -> None:
    assert top_k_similar([1.0], [], k=3) == ()
    assert top_k_similar([1.0], [[1.0]], k=0) == ()
    with pytest.raises(ValueError, match="non-negative"):
        top_k_similar([1.0], [[1.0]], k=-1)
