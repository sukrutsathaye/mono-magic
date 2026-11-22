"""Pure keyword masking utilities for fill-in-the-blank exercises."""

from __future__ import annotations

import re


def mask_keyword_in_sentence(
    sentence: str,
    keyword: str,
    *,
    placeholder: str = "_____",
    case_sensitive: bool = False,
) -> str:
    """Replace whole-word occurrences of ``keyword`` in ``sentence`` with ``placeholder``.

    Uses boundary-aware regex matching so partial words (e.g. ``"cat"`` inside
    ``"category"``) are never corrupted, while supporting multi-word phrases and
    punctuation edges cleanly.

    Args:
        sentence: Input sentence string.
        keyword: Word or multi-word phrase to mask.
        placeholder: Replacement mask string.
        case_sensitive: When ``False`` (default), match case-insensitively.

    Returns:
        A new string with matching occurrences replaced by ``placeholder``.
    """
    cleaned_keyword = keyword.strip()
    if not sentence or not cleaned_keyword:
        return sentence

    # Allow flexible internal whitespace when matching multi-word phrases.
    parts = [re.escape(part) for part in cleaned_keyword.split()]
    body = r"\s+".join(parts)

    prefix = r"(?<!\w)" if cleaned_keyword[0].isalnum() or cleaned_keyword[0] == "_" else r"(?<!\S)"
    suffix = r"(?!\w)" if cleaned_keyword[-1].isalnum() or cleaned_keyword[-1] == "_" else r"(?!\S)"

    flags = 0 if case_sensitive else re.IGNORECASE
    pattern = re.compile(f"{prefix}{body}{suffix}", flags)
    return pattern.sub(lambda _: placeholder, sentence)
