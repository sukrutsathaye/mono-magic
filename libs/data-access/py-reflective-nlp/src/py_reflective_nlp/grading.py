"""SemanticGrader and FastEmbedSemanticGrader with injectable embedding backend."""

from __future__ import annotations

import asyncio
import hashlib
import math
import re
from collections.abc import Sequence

from py_data_access_interfaces import DataAccessError, ErrorCode, Result, err, ok
from py_utils_nlp import clean_text, cosine_similarity

from .protocols import EmbeddingBackend
from .schemas import GradeBand, SubjectiveGradeResult, SubjectiveQuestionDTO

_TOKEN_RE = re.compile(r"[a-z0-9]+")


class DeterministicHashEmbeddingBackend:
    """Fast, offline, deterministic character/token n-gram embedding backend for unit tests.

    Projects normalized word unigrams, bigrams, and character trigrams into a fixed-dimension
    unit vector using feature hashing so semantically overlapping sentences produce high
    cosine similarity without downloading external ONNX weights during unit tests.
    """

    def __init__(self, dimensions: int = 128) -> None:
        """Initialize the feature-hashing embedder with ``dimensions``."""
        if dimensions < 8:
            raise ValueError("dimensions must be >= 8")
        self._dimensions = dimensions

    def _embed_single(self, text: str) -> list[float]:
        cleaned = clean_text(text).lower()
        tokens = _TOKEN_RE.findall(cleaned)
        if not tokens:
            return [0.0] * self._dimensions

        vec = [0.0] * self._dimensions
        features: list[tuple[str, float]] = []

        for tok in tokens:
            features.append((f"w:{tok}", 2.0))
            if len(tok) >= 3:
                for i in range(len(tok) - 2):
                    features.append((f"c3:{tok[i : i + 3]}", 0.5))

        for i in range(len(tokens) - 1):
            features.append((f"b:{tokens[i]}_{tokens[i + 1]}", 1.5))

        for feat, weight in features:
            digest = hashlib.blake2b(feat.encode("utf-8"), digest_size=8).digest()
            idx = int.from_bytes(digest[:4], "little") % self._dimensions
            sign = 1.0 if (digest[4] & 1) == 0 else -1.0
            vec[idx] += sign * weight

        norm = math.sqrt(sum(v * v for v in vec))
        if norm == 0.0:
            return vec
        return [v / norm for v in vec]

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        """Compute deterministic unit-normalized embedding vectors for ``texts``."""
        return [self._embed_single(t) for t in texts]


class FastEmbedSemanticGrader:
    """Lightweight semantic answer grader supporting ONNX FastEmbed or injectable backends."""

    def __init__(
        self,
        embedding_backend: EmbeddingBackend | None = None,
        *,
        model_name: str = "BAAI/bge-small-en-v1.5",
    ) -> None:
        """Initialize with an injectable ``EmbeddingBackend`` or fallback deterministic backend."""
        self._model_name = model_name
        self._backend: EmbeddingBackend = (
            embedding_backend
            if embedding_backend is not None
            else DeterministicHashEmbeddingBackend()
        )

    @property
    def model_name(self) -> str:
        """Return the configured embedding model identifier."""
        return self._model_name

    @staticmethod
    def classify_band(score: float) -> GradeBand:
        """Classify a similarity score in ``[0.0, 1.0]`` into a canonical ``GradeBand``."""
        if score >= 0.75:
            return GradeBand.CORRECT
        if score >= 0.40:
            return GradeBand.LIKELY_CORRECT
        if score >= 0.20:
            return GradeBand.LIKELY_WRONG
        return GradeBand.WRONG

    def _score_sync(self, reference_text: str, user_text: str) -> float:
        ref_clean = clean_text(reference_text).strip()
        user_clean = clean_text(user_text).strip()
        if not ref_clean or not user_clean:
            return 0.0

        vectors = self._backend.embed([ref_clean, user_clean])
        if len(vectors) < 2:
            return 0.0
        raw_sim = cosine_similarity(vectors[0], vectors[1])
        return max(0.0, min(1.0, float(raw_sim)))

    async def grade(
        self,
        question: SubjectiveQuestionDTO,
        user_answer: str,
    ) -> Result[SubjectiveGradeResult, DataAccessError]:
        """Grade ``user_answer`` against ``question.reference_sentences``."""
        if not user_answer.strip():
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message="Student answer cannot be empty.",
                    provider="semantic_grader",
                )
            )
        reference = " ".join(s.strip() for s in question.reference_sentences if s.strip())
        if not reference:
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message="Question has no reference sentences for grading.",
                    provider="semantic_grader",
                )
            )

        try:
            score = await asyncio.to_thread(self._score_sync, reference, user_answer)
        except Exception as exc:
            return err(
                DataAccessError(
                    code=ErrorCode.INTERNAL,
                    message=f"Embedding computation failed: {exc}",
                    provider="semantic_grader",
                    cause=str(exc),
                )
            )

        rounded_score = round(score, 4)
        band = self.classify_band(rounded_score)
        return ok(
            SubjectiveGradeResult(
                question_id=question.id,
                similarity_score=rounded_score,
                band=band,
                reference_answer=reference,
                feedback=f"Semantic match: {rounded_score:.0%} ({band.value})",
            )
        )
