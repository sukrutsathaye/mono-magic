"""Pure morphological normalization and keyword extraction algorithms."""

from __future__ import annotations

import math
import re
from collections import Counter, defaultdict
from collections.abc import Sequence
from collections.abc import Set as AbstractSet
from dataclasses import dataclass
from statistics import mean, median, pstdev

from py_utils_nlp.segmentation import split_sentences

DEFAULT_STOPWORDS: frozenset[str] = frozenset(
    {
        "a",
        "about",
        "above",
        "after",
        "again",
        "against",
        "all",
        "am",
        "an",
        "and",
        "any",
        "are",
        "as",
        "at",
        "be",
        "because",
        "been",
        "before",
        "being",
        "below",
        "between",
        "both",
        "but",
        "by",
        "can",
        "could",
        "did",
        "do",
        "does",
        "doing",
        "down",
        "during",
        "each",
        "few",
        "for",
        "from",
        "further",
        "had",
        "has",
        "have",
        "having",
        "he",
        "her",
        "here",
        "hers",
        "herself",
        "him",
        "himself",
        "his",
        "how",
        "i",
        "if",
        "in",
        "into",
        "is",
        "it",
        "its",
        "itself",
        "just",
        "me",
        "more",
        "most",
        "my",
        "myself",
        "no",
        "nor",
        "not",
        "now",
        "of",
        "off",
        "on",
        "once",
        "only",
        "or",
        "other",
        "our",
        "ours",
        "ourselves",
        "out",
        "over",
        "own",
        "same",
        "she",
        "should",
        "so",
        "some",
        "such",
        "than",
        "that",
        "the",
        "their",
        "theirs",
        "them",
        "themselves",
        "then",
        "there",
        "these",
        "they",
        "this",
        "those",
        "through",
        "to",
        "too",
        "under",
        "until",
        "up",
        "very",
        "was",
        "we",
        "were",
        "what",
        "when",
        "where",
        "which",
        "while",
        "who",
        "whom",
        "why",
        "will",
        "with",
        "would",
        "you",
        "your",
        "yours",
        "yourself",
        "yourselves",
    }
)

_TOKEN_PATTERN = re.compile(r"[A-Za-z][A-Za-z0-9'-]*")
_VOWELS: frozenset[str] = frozenset({"a", "e", "i", "o", "u"})

_IRREGULAR_SINGULAR_TO_PLURAL: dict[str, str] = {
    "analysis": "analyses",
    "axis": "axes",
    "basis": "bases",
    "cactus": "cacti",
    "child": "children",
    "crisis": "crises",
    "criterion": "criteria",
    "datum": "data",
    "diagnosis": "diagnoses",
    "foot": "feet",
    "fungus": "fungi",
    "goose": "geese",
    "hypothesis": "hypotheses",
    "index": "indices",
    "man": "men",
    "matrix": "matrices",
    "mouse": "mice",
    "nucleus": "nuclei",
    "ox": "oxen",
    "person": "people",
    "phenomenon": "phenomena",
    "quiz": "quizzes",
    "syllabus": "syllabi",
    "thesis": "theses",
    "tooth": "teeth",
    "vertex": "vertices",
    "woman": "women",
}

_IRREGULAR_PLURAL_TO_SINGULAR: dict[str, str] = {
    plural: singular for singular, plural in _IRREGULAR_SINGULAR_TO_PLURAL.items()
}

_INVARIANT_NOUNS: frozenset[str] = frozenset(
    {
        "aircraft",
        "deer",
        "fish",
        "means",
        "moose",
        "news",
        "offspring",
        "series",
        "sheep",
        "species",
    }
)

_FE_TO_VES: dict[str, str] = {
    "knife": "knives",
    "life": "lives",
    "wife": "wives",
}

_F_TO_VES: dict[str, str] = {
    "calf": "calves",
    "elf": "elves",
    "half": "halves",
    "leaf": "leaves",
    "loaf": "loaves",
    "self": "selves",
    "shelf": "shelves",
    "thief": "thieves",
    "wolf": "wolves",
}

_VES_TO_SINGULAR: dict[str, str] = {
    **{plural: singular for singular, plural in _FE_TO_VES.items()},
    **{plural: singular for singular, plural in _F_TO_VES.items()},
}


@dataclass(frozen=True, slots=True)
class ScoredKeyword:
    """Immutable keyword extraction result.

    Attributes:
        term: Normalized lowercase keyword or keyphrase.
        score: Relevance score (higher is more relevant across all extractors).
        frequency: Number of occurrences of ``term`` in the analyzed text/corpus.
    """

    term: str
    score: float
    frequency: int


def _match_casing(original: str, transformed: str) -> str:
    """Preserve uppercase or title-case styling from ``original`` on ``transformed``."""
    if original.isupper():
        return transformed.upper()
    if original[:1].isupper() and original[1:].islower():
        return transformed.capitalize()
    return transformed


def plural_to_singular(word: str) -> str:
    """Convert an English plural noun to its singular form using morphological rules.

    Handles common irregular nouns, invariant nouns, ``-ies``, ``-ves``, sibilant
    ``-es``, and regular ``-s`` endings while preserving original casing style.

    Args:
        word: Input English word.

    Returns:
        Singularized word string.
    """
    stripped = word.strip()
    if len(stripped) <= 2:
        return stripped

    lower = stripped.lower()
    if lower in _INVARIANT_NOUNS:
        return stripped
    if lower in _IRREGULAR_PLURAL_TO_SINGULAR:
        return _match_casing(stripped, _IRREGULAR_PLURAL_TO_SINGULAR[lower])
    if lower in _VES_TO_SINGULAR:
        return _match_casing(stripped, _VES_TO_SINGULAR[lower])

    if lower.endswith("ies") and len(lower) > 3 and lower[-4] not in _VOWELS:
        return _match_casing(stripped, f"{lower[:-3]}y")

    if lower.endswith(("ches", "shes", "sses", "xes", "zes")):
        return _match_casing(stripped, lower[:-2])

    if lower.endswith("s") and not lower.endswith(("ss", "us", "is")):
        return _match_casing(stripped, lower[:-1])

    return stripped


def singular_to_plural(word: str) -> str:
    """Convert an English singular noun to its plural form using morphological rules.

    Handles common irregular nouns, invariant nouns, consonant + ``-y``, ``-f``/``-fe``
    to ``-ves``, sibilant ``-es``, and regular ``-s`` endings while preserving casing.

    Args:
        word: Input English word.

    Returns:
        Pluralized word string.
    """
    stripped = word.strip()
    if not stripped:
        return ""

    lower = stripped.lower()
    if lower in _INVARIANT_NOUNS:
        return stripped
    if lower in _IRREGULAR_SINGULAR_TO_PLURAL:
        return _match_casing(stripped, _IRREGULAR_SINGULAR_TO_PLURAL[lower])
    if lower in _FE_TO_VES:
        return _match_casing(stripped, _FE_TO_VES[lower])
    if lower in _F_TO_VES:
        return _match_casing(stripped, _F_TO_VES[lower])

    if len(lower) >= 2 and lower.endswith("y") and lower[-2] not in _VOWELS:
        return _match_casing(stripped, f"{lower[:-1]}ies")

    if lower.endswith(("s", "x", "z", "ch", "sh")):
        return _match_casing(stripped, f"{lower}es")

    return _match_casing(stripped, f"{lower}s")


def _tokenize_lower(text: str, stopset: frozenset[str]) -> list[str]:
    """Extract lowercase candidate tokens excluding stopwords and single-char noise."""
    return [
        tok
        for raw in _TOKEN_PATTERN.findall(text)
        if len(tok := raw.lower().strip("'-")) > 1 and tok not in stopset
    ]


def _resolve_stopwords(stopwords: AbstractSet[str] | None) -> frozenset[str]:
    """Normalize an optional stopword set to a lowercase ``frozenset``."""
    if stopwords is None:
        return DEFAULT_STOPWORDS
    return frozenset(w.lower() for w in stopwords)


def extract_keywords_tfidf(
    documents: Sequence[str],
    *,
    top_k: int = 10,
    stopwords: AbstractSet[str] | None = None,
) -> tuple[ScoredKeyword, ...]:
    """Extract top keywords across documents using smoothed TF-IDF scoring.

    Uses ``tf(t, d) = count(t, d) / len(d)`` and ``idf(t) = ln((1 + N) / (1 + df(t))) + 1``.
    A term's corpus score is its maximum TF-IDF score across documents, paired with
    its total corpus frequency.

    Args:
        documents: Sequence of document strings.
        top_k: Maximum number of keywords to return.
        stopwords: Optional custom stopword set; defaults to :data:`DEFAULT_STOPWORDS`.

    Returns:
        Immutable tuple of :class:`ScoredKeyword` sorted descending by relevance score.

    Raises:
        ValueError: If ``top_k`` is negative.
    """
    if top_k < 0:
        raise ValueError("top_k must be non-negative")
    if top_k == 0 or not documents:
        return ()

    stopset = _resolve_stopwords(stopwords)
    tokenized_docs = [_tokenize_lower(doc, stopset) for doc in documents]
    non_empty_docs = [tokens for tokens in tokenized_docs if tokens]
    if not non_empty_docs:
        return ()

    n_docs = len(non_empty_docs)
    doc_freq: Counter[str] = Counter()
    total_freq: Counter[str] = Counter()

    for tokens in non_empty_docs:
        counts = Counter(tokens)
        total_freq.update(counts)
        for term in counts:
            doc_freq[term] += 1

    best_scores: dict[str, float] = {}
    for tokens in non_empty_docs:
        doc_len = len(tokens)
        counts = Counter(tokens)
        for term, count in counts.items():
            tf = count / doc_len
            idf = math.log((1.0 + n_docs) / (1.0 + doc_freq[term])) + 1.0
            score = tf * idf
            if score > best_scores.get(term, 0.0):
                best_scores[term] = score

    ranked = sorted(
        (
            ScoredKeyword(term=term, score=score, frequency=total_freq[term])
            for term, score in best_scores.items()
        ),
        key=lambda item: (-item.score, -item.frequency, item.term),
    )
    return tuple(ranked[:top_k])


def extract_keywords_textrank(
    text: str,
    *,
    top_k: int = 10,
    window_size: int = 4,
    damping: float = 0.85,
    max_iter: int = 30,
    stopwords: AbstractSet[str] | None = None,
) -> tuple[ScoredKeyword, ...]:
    """Extract top keywords from text using a co-occurrence graph and PageRank.

    Builds an undirected weighted co-occurrence graph where words appearing within
    ``window_size`` tokens of each other share an edge, then iteratively computes
    weighted PageRank scores.

    Args:
        text: Input document text.
        top_k: Maximum number of keywords to return.
        window_size: Sliding co-occurrence window size (must be ``>= 2``).
        damping: PageRank damping factor in ``(0, 1)``.
        max_iter: Maximum number of PageRank power iterations (must be ``>= 1``).
        stopwords: Optional custom stopword set; defaults to :data:`DEFAULT_STOPWORDS`.

    Returns:
        Immutable tuple of :class:`ScoredKeyword` sorted descending by PageRank score.

    Raises:
        ValueError: If parameters are out of valid bounds.
    """
    if top_k < 0:
        raise ValueError("top_k must be non-negative")
    if window_size < 2:
        raise ValueError("window_size must be at least 2")
    if not (0.0 < damping < 1.0):
        raise ValueError("damping must be strictly between 0 and 1")
    if max_iter < 1:
        raise ValueError("max_iter must be at least 1")
    if top_k == 0 or not text.strip():
        return ()

    stopset = _resolve_stopwords(stopwords)
    tokens = _tokenize_lower(text, stopset)
    if not tokens:
        return ()

    freq = Counter(tokens)
    vocab = sorted(freq.keys())

    # Build undirected weighted co-occurrence adjacency map.
    graph: dict[str, dict[str, float]] = {term: {} for term in vocab}
    n_tokens = len(tokens)
    for i in range(n_tokens):
        src = tokens[i]
        upper = min(i + window_size, n_tokens)
        for j in range(i + 1, upper):
            dst = tokens[j]
            if src == dst:
                continue
            graph[src][dst] = graph[src].get(dst, 0.0) + 1.0
            graph[dst][src] = graph[dst].get(src, 0.0) + 1.0

    out_weights: dict[str, float] = {
        term: sum(neighbors.values()) for term, neighbors in graph.items()
    }
    ranks: dict[str, float] = {term: 1.0 for term in vocab}

    for _ in range(max_iter):
        next_ranks: dict[str, float] = {}
        max_delta = 0.0
        for term in vocab:
            rank_sum = 0.0
            for neighbor, weight in graph[term].items():
                denom = out_weights[neighbor]
                if denom > 0.0:
                    rank_sum += (weight / denom) * ranks[neighbor]
            updated = (1.0 - damping) + damping * rank_sum
            next_ranks[term] = updated
            max_delta = max(max_delta, abs(updated - ranks[term]))
        ranks = next_ranks
        if max_delta < 1e-6:
            break

    ranked = sorted(
        (ScoredKeyword(term=term, score=ranks[term], frequency=freq[term]) for term in vocab),
        key=lambda item: (-item.score, -item.frequency, item.term),
    )
    return tuple(ranked[:top_k])


def extract_keywords_yake(
    text: str,
    *,
    top_k: int = 10,
    max_ngram: int = 2,
    stopwords: AbstractSet[str] | None = None,
) -> tuple[ScoredKeyword, ...]:
    """Extract top keywords/keyphrases using YAKE!-inspired statistical features.

    Scores individual terms from casing prominence, earliest sentence position,
    normalized frequency, context relatedness, and cross-sentence dispersion, then
    aggregates candidate n-grams (up to ``max_ngram``). Raw YAKE scores (where lower
    is better) are mapped via ``1 / (1 + raw_score)`` so the returned
    :class:`ScoredKeyword` tuples are consistently sorted best-first (higher is better).

    Args:
        text: Input document text.
        top_k: Maximum number of keywords or keyphrases to return.
        max_ngram: Maximum n-gram length (must be ``>= 1``).
        stopwords: Optional custom stopword set; defaults to :data:`DEFAULT_STOPWORDS`.

    Returns:
        Immutable tuple of :class:`ScoredKeyword` sorted descending by relevance score.

    Raises:
        ValueError: If ``top_k < 0`` or ``max_ngram < 1``.
    """
    if top_k < 0:
        raise ValueError("top_k must be non-negative")
    if max_ngram < 1:
        raise ValueError("max_ngram must be at least 1")
    if top_k == 0 or not text.strip():
        return ()

    stopset = _resolve_stopwords(stopwords)
    sentences = split_sentences(text, min_length=1)
    if not sentences:
        return ()

    sent_tokens_raw: list[list[str]] = [
        [tok.strip("'-") for tok in _TOKEN_PATTERN.findall(s) if len(tok.strip("'-")) > 1]
        for s in sentences
    ]

    term_tf: Counter[str] = Counter()
    term_caps: Counter[str] = Counter()
    term_sent_indices: dict[str, list[int]] = defaultdict(list)
    left_ctx: dict[str, set[str]] = defaultdict(set)
    right_ctx: dict[str, set[str]] = defaultdict(set)

    for sent_idx, raw_tokens in enumerate(sent_tokens_raw):
        lower_tokens = [tok.lower() for tok in raw_tokens]
        for pos, (raw_tok, low_tok) in enumerate(zip(raw_tokens, lower_tokens, strict=True)):
            term_tf[low_tok] += 1
            term_sent_indices[low_tok].append(sent_idx)
            # Count uppercase acronyms or non-sentence-initial capitalized words.
            if raw_tok.isupper() or (pos > 0 and raw_tok[:1].isupper()):
                term_caps[low_tok] += 1
            if pos > 0:
                left_ctx[low_tok].add(lower_tokens[pos - 1])
            if pos + 1 < len(lower_tokens):
                right_ctx[low_tok].add(lower_tokens[pos + 1])

    if not term_tf:
        return ()

    tf_values = list(term_tf.values())
    mean_tf = mean(tf_values)
    std_tf = pstdev(tf_values)
    max_tf = max(tf_values)
    n_sents = len(sentences)

    term_raw_score: dict[str, float] = {}
    for term, tf in term_tf.items():
        t_case = term_caps[term] / (1.0 + math.log(tf))
        med_pos = median(term_sent_indices[term])
        t_pos = math.log(math.log(3.0 + med_pos))
        denom_norm = mean_tf + std_tf
        t_norm = tf / denom_norm if denom_norm > 0.0 else 1.0
        dl = len(left_ctx[term])
        dr = len(right_ctx[term])
        t_rel = 1.0 + (dl + dr) * (tf / max_tf)
        t_dif_sent = len(set(term_sent_indices[term])) / n_sents

        numerator = t_rel * t_pos
        denominator = t_case + (t_norm / t_rel) + (t_dif_sent / t_rel)
        term_raw_score[term] = numerator / denominator if denominator > 0.0 else numerator

    ngram_freq: Counter[str] = Counter()
    ngram_terms: dict[str, tuple[str, ...]] = {}

    for raw_tokens in sent_tokens_raw:
        lower_tokens = [tok.lower() for tok in raw_tokens]
        seq_len = len(lower_tokens)
        for n in range(1, max_ngram + 1):
            for start in range(seq_len - n + 1):
                window = tuple(lower_tokens[start : start + n])
                # Candidate n-grams must not start or end with a stopword.
                if window[0] in stopset or window[-1] in stopset:
                    continue
                phrase = " ".join(window)
                ngram_freq[phrase] += 1
                ngram_terms[phrase] = window

    scored: list[ScoredKeyword] = []
    for phrase, freq in ngram_freq.items():
        parts = ngram_terms[phrase]
        raw_parts = [term_raw_score[part] for part in parts]
        product = math.prod(raw_parts)
        raw_ngram = product / (freq * (1.0 + sum(raw_parts)))
        relevance = 1.0 / (1.0 + raw_ngram)
        scored.append(ScoredKeyword(term=phrase, score=relevance, frequency=freq))

    scored.sort(key=lambda item: (-item.score, -item.frequency, item.term))
    return tuple(scored[:top_k])
