"""Pure vector similarity utilities."""

from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class SimilarityMatch:
    """Immutable top-k vector similarity match.

    Attributes:
        index: Zero-based index into the candidate sequence.
        score: Cosine similarity score in ``[-1.0, 1.0]``.
    """

    index: int
    score: float


def cosine_similarity(vec_a: Sequence[float], vec_b: Sequence[float]) -> float:
    """Compute cosine similarity between two equal-length non-empty numeric vectors.

    Returns ``0.0`` when either vector has zero Euclidean norm, and clamps the
    computed ratio to ``[-1.0, 1.0]`` to guard against floating-point drift.

    Args:
        vec_a: First numeric vector.
        vec_b: Second numeric vector.

    Returns:
        Cosine similarity in ``[-1.0, 1.0]``.

    Raises:
        ValueError: If either vector is empty or their lengths differ.
    """
    if len(vec_a) == 0 or len(vec_b) == 0:
        raise ValueError("Input vectors must be non-empty")
    if len(vec_a) != len(vec_b):
        raise ValueError(f"Vector length mismatch: {len(vec_a)} != {len(vec_b)}")

    dot = 0.0
    norm_a_sq = 0.0
    norm_b_sq = 0.0
    for a, b in zip(vec_a, vec_b, strict=True):
        fa = float(a)
        fb = float(b)
        dot += fa * fb
        norm_a_sq += fa * fa
        norm_b_sq += fb * fb

    if norm_a_sq == 0.0 or norm_b_sq == 0.0:
        return 0.0

    ratio = dot / math.sqrt(norm_a_sq * norm_b_sq)
    return max(-1.0, min(1.0, ratio))


def top_k_similar(
    query: Sequence[float],
    candidates: Sequence[Sequence[float]],
    *,
    k: int = 5,
) -> tuple[SimilarityMatch, ...]:
    """Return the top ``k`` candidates most similar to ``query`` by cosine similarity.

    Args:
        query: Query embedding vector.
        candidates: Sequence of candidate embedding vectors.
        k: Maximum number of matches to return (must be ``>= 0``).

    Returns:
        Immutable tuple of :class:`SimilarityMatch` sorted by descending ``score``
        (with ties broken by ascending ``index``).

    Raises:
        ValueError: If ``k < 0`` or any vector comparison fails validation.
    """
    if k < 0:
        raise ValueError("k must be non-negative")
    if k == 0 or not candidates:
        return ()

    matches = [
        SimilarityMatch(index=idx, score=cosine_similarity(query, candidate))
        for idx, candidate in enumerate(candidates)
    ]
    matches.sort(key=lambda item: (-item.score, item.index))
    return tuple(matches[:k])
