"""Unit tests for py_utils_nlp.segmentation."""

from __future__ import annotations

import pytest
from py_utils_nlp import sentences_per_paragraph, split_paragraphs, split_sentences


def test_split_paragraphs_basic_and_min_length() -> None:
    text = "Short.\n\nThis is a longer second paragraph.\r\n\r\n   Third paragraph here.  "
    assert split_paragraphs(text) == (
        "Short.",
        "This is a longer second paragraph.",
        "Third paragraph here.",
    )
    assert split_paragraphs(text, min_length=10) == (
        "This is a longer second paragraph.",
        "Third paragraph here.",
    )
    assert split_paragraphs("   \n\n  ") == ()


def test_split_paragraphs_rejects_negative_min_length() -> None:
    with pytest.raises(ValueError, match="non-negative"):
        split_paragraphs("Hello", min_length=-1)


def test_split_sentences_handles_abbreviations_initials_and_decimals() -> None:
    text = (
        "Dr. J. K. Smith visited the U.S. lab to measure pi at 3.14, e.g. in physics. "
        "Mr. Jones asked: is it accurate? Yes! That is great."
    )
    result = split_sentences(text)
    assert result == (
        "Dr. J. K. Smith visited the U.S. lab to measure pi at 3.14, e.g. in physics.",
        "Mr. Jones asked: is it accurate?",
        "Yes!",
        "That is great.",
    )


def test_split_sentences_min_length_and_empty() -> None:
    assert split_sentences("Hi. This is a full sentence.", min_length=5) == (
        "This is a full sentence.",
    )
    assert split_sentences("   ") == ()
    with pytest.raises(ValueError, match="non-negative"):
        split_sentences("Hello.", min_length=-2)


def test_sentences_per_paragraph_does_not_mutate_input() -> None:
    paragraphs = [
        "Hi.",
        "First sentence. Second sentence!",
        "   ",
        "Another paragraph with one sentence.",
    ]
    snapshot = list(paragraphs)
    grouped = sentences_per_paragraph(
        paragraphs,
        min_paragraph_length=5,
        min_sentence_length=5,
    )
    assert paragraphs == snapshot
    assert grouped == (
        ("First sentence.", "Second sentence!"),
        ("Another paragraph with one sentence.",),
    )


def test_sentences_per_paragraph_rejects_negative_thresholds() -> None:
    with pytest.raises(ValueError, match="non-negative"):
        sentences_per_paragraph(["Hello."], min_paragraph_length=-1)
    with pytest.raises(ValueError, match="non-negative"):
        sentences_per_paragraph(["Hello."], min_sentence_length=-1)
