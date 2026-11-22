"""Pure paragraph and sentence segmentation utilities."""

from __future__ import annotations

import re
from collections.abc import Sequence

_PARAGRAPH_SPLIT_PATTERN = re.compile(r"\n\s*\n+")
_WHITESPACE_COLLAPSE_PATTERN = re.compile(r"\s+")

_ABBREVIATIONS: frozenset[str] = frozenset(
    {
        "al",
        "approx",
        "ca",
        "cf",
        "co",
        "corp",
        "dept",
        "dr",
        "e.g",
        "ed",
        "eds",
        "eg",
        "eq",
        "est",
        "etc",
        "fig",
        "figs",
        "gov",
        "i.e",
        "ie",
        "inc",
        "jan",
        "feb",
        "mar",
        "apr",
        "jun",
        "jul",
        "aug",
        "sep",
        "sept",
        "oct",
        "nov",
        "dec",
        "jr",
        "ltd",
        "mr",
        "mrs",
        "ms",
        "no",
        "nos",
        "p",
        "pp",
        "ph.d",
        "prof",
        "rev",
        "sec",
        "sen",
        "sr",
        "st",
        "u.k",
        "u.s",
        "u.s.a",
        "v",
        "vol",
        "vols",
        "vs",
    }
)

# Candidate sentence boundary: punctuation followed by optional closing delimiters
# and one or more whitespace characters.
_BOUNDARY_PATTERN = re.compile(r"([.!?]+)([\"'\)\]\u201d\u2019]*)(\s+)")
_WORD_BEFORE_DOT_PATTERN = re.compile(r"([A-Za-z][A-Za-z.]*)$")
_DOTTED_ACRONYM_PATTERN = re.compile(r"^(?:[A-Za-z]\.){1,}[A-Za-z]$")


def split_paragraphs(text: str, *, min_length: int = 1) -> tuple[str, ...]:
    """Split text into cleaned paragraphs separated by blank lines.

    Args:
        text: Input text containing one or more paragraphs.
        min_length: Minimum character length required for a paragraph to be kept.

    Returns:
        Immutable tuple of non-empty paragraphs meeting ``min_length``.

    Raises:
        ValueError: If ``min_length`` is negative.
    """
    if min_length < 0:
        raise ValueError("min_length must be non-negative")
    if not text.strip():
        return ()

    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    paragraphs: list[str] = []
    for raw_paragraph in _PARAGRAPH_SPLIT_PATTERN.split(normalized):
        collapsed = _WHITESPACE_COLLAPSE_PATTERN.sub(" ", raw_paragraph).strip()
        if len(collapsed) >= min_length and collapsed:
            paragraphs.append(collapsed)
    return tuple(paragraphs)


def _is_non_terminal_period(text: str, punct_start: int, punct: str, after_ws_pos: int) -> bool:
    """Determine whether a period at ``punct_start`` is part of an abbreviation or number."""
    if punct != ".":
        return False

    # Decimal or version numbers like "3.14" (handled naturally if no space follows,
    # and guarded here if whitespace follows a trailing decimal).
    if (
        punct_start > 0
        and text[punct_start - 1].isdigit()
        and after_ws_pos < len(text)
        and text[after_ws_pos].isdigit()
    ):
        return True

    prefix = text[:punct_start]
    word_match = _WORD_BEFORE_DOT_PATTERN.search(prefix)
    if word_match is None:
        return False

    token = word_match.group(1)
    lowered = token.lower()

    if lowered in _ABBREVIATIONS:
        return True

    # Single-letter initial (e.g., "J. K. Rowling") or dotted acronym (e.g., "U.S.").
    if len(token) == 1 and token.isalpha():
        return True
    return _DOTTED_ACRONYM_PATTERN.match(token) is not None


def split_sentences(text: str, *, min_length: int = 1) -> tuple[str, ...]:
    """Split text into sentences while respecting common abbreviations and decimals.

    Args:
        text: Input text to segment into sentences.
        min_length: Minimum character length required for a sentence to be kept.

    Returns:
        Immutable tuple of sentences meeting ``min_length``.

    Raises:
        ValueError: If ``min_length`` is negative.
    """
    if min_length < 0:
        raise ValueError("min_length must be non-negative")

    normalized = _WHITESPACE_COLLAPSE_PATTERN.sub(" ", text).strip()
    if not normalized:
        return ()

    sentences: list[str] = []
    start = 0

    for match in _BOUNDARY_PATTERN.finditer(normalized):
        punct = match.group(1)
        punct_start = match.start(1)
        after_ws_pos = match.end(3)

        if _is_non_terminal_period(normalized, punct_start, punct, after_ws_pos):
            continue

        segment = normalized[start : match.end(2)].strip()
        if segment and len(segment) >= min_length:
            sentences.append(segment)
        start = after_ws_pos

    tail = normalized[start:].strip()
    if tail and len(tail) >= min_length:
        sentences.append(tail)

    return tuple(sentences)


def sentences_per_paragraph(
    paragraphs: Sequence[str],
    *,
    min_paragraph_length: int = 1,
    min_sentence_length: int = 1,
) -> tuple[tuple[str, ...], ...]:
    """Segment a sequence of paragraphs into per-paragraph sentence tuples.

    Does not mutate ``paragraphs`` and filters out paragraphs or sentences shorter
    than the configured minimum lengths.

    Args:
        paragraphs: Sequence of paragraph strings.
        min_paragraph_length: Minimum stripped length for a paragraph to be processed.
        min_sentence_length: Minimum length for each extracted sentence.

    Returns:
        Immutable tuple of sentence tuples, one per retained non-empty paragraph.

    Raises:
        ValueError: If ``min_paragraph_length`` or ``min_sentence_length`` is negative.
    """
    if min_paragraph_length < 0 or min_sentence_length < 0:
        raise ValueError("Minimum length thresholds must be non-negative")

    result: list[tuple[str, ...]] = []
    for paragraph in paragraphs:
        stripped = paragraph.strip()
        if len(stripped) < min_paragraph_length:
            continue
        sentences = split_sentences(stripped, min_length=min_sentence_length)
        if sentences:
            result.append(sentences)
    return tuple(result)
