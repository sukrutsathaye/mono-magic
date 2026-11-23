"""Unit tests for py_utils_nlp.cleaning."""

from __future__ import annotations

from py_utils_nlp import clean_text


def test_clean_text_strips_citations_and_collapses_whitespace() -> None:
    raw = (
        "Photosynthesis converts light energy into chemical energy [1][12, 13].\r\n"
        "It occurs in plants [citation needed] and algae [note 1].\r\n\r\n\r\n"
        "   Second   paragraph\twith \u200b extra   spaces.  "
    )
    cleaned = clean_text(raw)
    assert cleaned == (
        "Photosynthesis converts light energy into chemical energy.\n"
        "It occurs in plants and algae.\n\n"
        "Second paragraph with extra spaces."
    )


def test_clean_text_respects_flags() -> None:
    raw = "Value is \uff11\uff12\uff13 [1]."
    assert clean_text(raw, strip_citations=False, normalize_unicode=True) == "Value is 123 [1]."
    assert (
        clean_text(raw, strip_citations=True, normalize_unicode=False)
        == "Value is \uff11\uff12\uff13."
    )


def test_clean_text_handles_empty_input() -> None:
    assert clean_text("") == ""
    assert clean_text("   \n\t  ") == ""
