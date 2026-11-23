"""Pure text-cleaning and normalization utilities."""

from __future__ import annotations

import re
import unicodedata

# Matches Wikipedia/academic inline bracketed citations such as [1], [12, 13],
# [1-4], [note 1], [a], [citation needed], [clarification needed], [who?].
_CITATION_PATTERN = re.compile(
    r"\[\s*(?:"
    r"\d+(?:\s*[-\u2013,]\s*\d+)*"
    r"|[a-z]"
    r"|(?:note|fn|nb|ref)\s*\d*"
    r"|(?:citation|clarification|verification|further explanation)\s+needed"
    r"|(?:original\s+research|who|when|where|by\s+whom|dubious)\??"
    r")\s*\]",
    re.IGNORECASE,
)

_ZERO_WIDTH_PATTERN = re.compile(r"[\u200b\u200c\u200d\ufeff]")
_HORIZONTAL_WS_PATTERN = re.compile(r"[^\S\n]+")
_SPACE_BEFORE_PUNCT_PATTERN = re.compile(r" +([,.;:!?])")
_EXCESS_NEWLINES_PATTERN = re.compile(r"\n{3,}")


def clean_text(
    text: str,
    *,
    strip_citations: bool = True,
    normalize_unicode: bool = True,
) -> str:
    """Clean and normalize raw text without mutating inputs.

    Performs optional Unicode NFKC normalization, optional removal of inline
    bracketed citations (e.g. ``[1]``, ``[12, 13]``, ``[citation needed]``,
    ``[note 1]``), zero-width character stripping, line-ending standardization,
    and whitespace collapsing while preserving paragraph breaks.

    Args:
        text: Raw input string to clean.
        strip_citations: When ``True``, remove bracketed inline citations.
        normalize_unicode: When ``True``, apply Unicode NFKC normalization.

    Returns:
        A newly allocated cleaned string.
    """
    if not text:
        return ""

    result = text.replace("\r\n", "\n").replace("\r", "\n")
    result = _ZERO_WIDTH_PATTERN.sub("", result)

    if normalize_unicode:
        result = unicodedata.normalize("NFKC", result)

    if strip_citations:
        result = _CITATION_PATTERN.sub("", result)

    # Normalize horizontal whitespace line by line while preserving paragraph structure.
    cleaned_lines = [
        _SPACE_BEFORE_PUNCT_PATTERN.sub(r"\1", _HORIZONTAL_WS_PATTERN.sub(" ", line)).strip()
        for line in result.split("\n")
    ]
    result = "\n".join(cleaned_lines)
    result = _EXCESS_NEWLINES_PATTERN.sub("\n\n", result)
    return result.strip()
