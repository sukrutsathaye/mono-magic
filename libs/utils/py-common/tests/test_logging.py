"""Unit tests for py_utils_common.logging."""

from __future__ import annotations

import io
import json
import logging
from typing import Any

import pytest
from py_utils_common import (
    JsonFormatter,
    configure_logging,
    correlation_context,
    correlation_id_var,
    get_correlation_id,
    get_logger,
    reset_correlation_id,
    set_correlation_id,
)


def test_correlation_id_lifecycle() -> None:
    assert get_correlation_id() is None
    token = set_correlation_id("req-123")
    try:
        assert get_correlation_id() == "req-123"
        assert correlation_id_var.get() == "req-123"
    finally:
        reset_correlation_id(token)
    assert get_correlation_id() is None


def test_correlation_context_restores_nested_ids() -> None:
    assert get_correlation_id() is None
    with correlation_context("outer-id") as outer:
        assert outer == "outer-id"
        assert get_correlation_id() == "outer-id"
        with correlation_context("inner-id") as inner:
            assert inner == "inner-id"
            assert get_correlation_id() == "inner-id"
        assert get_correlation_id() == "outer-id"
    assert get_correlation_id() is None


def test_correlation_context_restores_on_exception() -> None:
    with pytest.raises(RuntimeError, match="boom"), correlation_context("err-id"):
        assert get_correlation_id() == "err-id"
        raise RuntimeError("boom")
    assert get_correlation_id() is None


def test_configure_logging_emits_structured_json() -> None:
    stream = io.StringIO()
    logger = configure_logging("DEBUG", stream=stream, logger_name="test.structured")

    with correlation_context("cid-42"):
        logger.info("user signed in", extra={"user_id": "u-9", "attempt": 1})

    output = stream.getvalue().strip()
    parsed: dict[str, Any] = json.loads(output)
    assert parsed["level"] == "INFO"
    assert parsed["logger"] == "test.structured"
    assert parsed["message"] == "user signed in"
    assert parsed["correlation_id"] == "cid-42"
    assert parsed["extra"] == {"user_id": "u-9", "attempt": 1}
    assert "T" in parsed["timestamp"]


def test_json_formatter_explicit_correlation_id_and_exception() -> None:
    stream = io.StringIO()
    logger = configure_logging(logging.INFO, stream=stream, logger_name="test.exc")

    try:
        raise ValueError("bad input")
    except ValueError:
        logger.exception("failed request", extra={"correlation_id": "explicit-cid"})

    parsed: dict[str, Any] = json.loads(stream.getvalue().strip())
    assert parsed["correlation_id"] == "explicit-cid"
    assert "ValueError: bad input" in parsed["exception"]
    assert "extra" not in parsed


def test_configure_logging_replaces_existing_handlers() -> None:
    stream1 = io.StringIO()
    stream2 = io.StringIO()
    configure_logging("INFO", stream=stream1, logger_name="test.reconfig")
    logger = configure_logging("INFO", stream=stream2, logger_name="test.reconfig")

    assert len(logger.handlers) == 1
    assert isinstance(logger.handlers[0].formatter, JsonFormatter)
    logger.info("only once")

    assert stream1.getvalue() == ""
    assert len(stream2.getvalue().strip().splitlines()) == 1


def test_get_logger_returns_named_logger() -> None:
    logger = get_logger("mono_magic.sample")
    assert logger.name == "mono_magic.sample"
