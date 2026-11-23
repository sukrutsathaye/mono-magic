"""Unit tests for py_utils_nlp.masking."""

from __future__ import annotations

from py_utils_nlp import mask_keyword_in_sentence


def test_mask_keyword_avoids_partial_word_corruption() -> None:
    sentence = "The cat sat near the category catalog, while another Cat slept."
    masked = mask_keyword_in_sentence(sentence, "cat")
    assert masked == "The _____ sat near the category catalog, while another _____ slept."


def test_mask_keyword_case_sensitive_and_custom_placeholder() -> None:
    sentence = "Python and python are both listed."
    masked = mask_keyword_in_sentence(
        sentence,
        "Python",
        placeholder="[MASK]",
        case_sensitive=True,
    )
    assert masked == "[MASK] and python are both listed."


def test_mask_keyword_multiword_and_punctuation_edges() -> None:
    sentence = "We use active  recall, and C++ daily!"
    assert mask_keyword_in_sentence(sentence, "active recall") == "We use _____, and C++ daily!"
    assert mask_keyword_in_sentence(sentence, "C++") == "We use active  recall, and _____ daily!"


def test_mask_keyword_symbol_adjacent_to_punctuation() -> None:
    sentence = "Use (C++) and C++!"
    assert mask_keyword_in_sentence(sentence, "C++") == "Use (_____) and _____!"
    assert mask_keyword_in_sentence("Use C++20 and C++.", "C++") == "Use C++20 and _____."


def test_mask_keyword_empty_inputs() -> None:
    assert mask_keyword_in_sentence("", "cat") == ""
    assert mask_keyword_in_sentence("Hello world.", "   ") == "Hello world."
