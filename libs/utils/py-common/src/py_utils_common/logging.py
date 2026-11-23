"""Structured JSON logging and correlation ID context utilities."""

from __future__ import annotations

import json
import logging
import sys
from collections.abc import Generator
from contextlib import contextmanager
from contextvars import ContextVar, Token
from datetime import UTC, datetime
from typing import Any, TextIO

correlation_id_var: ContextVar[str | None] = ContextVar("correlation_id", default=None)

_STANDARD_LOG_RECORD_ATTRS: frozenset[str] = frozenset(
    {
        "args",
        "asctime",
        "created",
        "exc_info",
        "exc_text",
        "filename",
        "funcName",
        "levelname",
        "levelno",
        "lineno",
        "message",
        "module",
        "msecs",
        "msg",
        "name",
        "pathname",
        "process",
        "processName",
        "relativeCreated",
        "stack_info",
        "taskName",
        "thread",
        "threadName",
    }
)


def get_correlation_id() -> str | None:
    """Return the active correlation ID for the current execution context."""
    return correlation_id_var.get()


def set_correlation_id(correlation_id: str | None) -> Token[str | None]:
    """Set the active correlation ID and return a reset token.

    Args:
        correlation_id: The correlation identifier to bind, or ``None`` to clear.

    Returns:
        A ``ContextVar`` token that can be passed to :func:`reset_correlation_id`.
    """
    return correlation_id_var.set(correlation_id)


def reset_correlation_id(token: Token[str | None]) -> None:
    """Restore the previous correlation ID using a token from :func:`set_correlation_id`.

    Args:
        token: Token returned by :func:`set_correlation_id`.
    """
    correlation_id_var.reset(token)


@contextmanager
def correlation_context(cid: str | None) -> Generator[str | None, None, None]:
    """Bind a correlation ID for the duration of a ``with`` block.

    Args:
        cid: Correlation ID to bind within the context block.

    Yields:
        The bound correlation ID.
    """
    token = set_correlation_id(cid)
    try:
        yield cid
    finally:
        reset_correlation_id(token)


class JsonFormatter(logging.Formatter):
    """Logging formatter that serializes log records as single-line JSON objects."""

    def format(self, record: logging.LogRecord) -> str:
        """Format a ``LogRecord`` into a structured JSON string.

        Args:
            record: Standard Python logging record.

        Returns:
            A single-line JSON string containing timestamp, level, logger, message,
            correlation_id, and any optional extra fields or exception info.
        """
        timestamp = datetime.fromtimestamp(record.created, tz=UTC).isoformat()
        explicit_cid = record.__dict__.get("correlation_id")
        cid: str | None = explicit_cid if isinstance(explicit_cid, str) else get_correlation_id()

        payload: dict[str, Any] = {
            "timestamp": timestamp,
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "correlation_id": cid,
        }

        extra_fields: dict[str, Any] = {
            key: value
            for key, value in record.__dict__.items()
            if key not in _STANDARD_LOG_RECORD_ATTRS
            and key != "correlation_id"
            and not key.startswith("_")
        }
        if extra_fields:
            payload["extra"] = extra_fields

        if record.exc_info is not None:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str, ensure_ascii=False)


def configure_logging(
    level: int | str = logging.INFO,
    *,
    stream: TextIO | None = None,
    logger_name: str | None = None,
) -> logging.Logger:
    """Configure a logger with :class:`JsonFormatter` writing to ``stream``.

    Replaces any existing handlers on the target logger to prevent duplicate log
    lines when called multiple times.

    Args:
        level: Logging level (e.g. ``logging.INFO`` or ``"DEBUG"``).
        stream: Target text stream; defaults to ``sys.stdout``.
        logger_name: Specific logger name to configure, or ``None`` for the root logger.

    Returns:
        The configured :class:`logging.Logger` instance.
    """
    logger = logging.getLogger(logger_name)
    logger.setLevel(level)

    handler = logging.StreamHandler(stream if stream is not None else sys.stdout)
    handler.setLevel(level)
    handler.setFormatter(JsonFormatter())

    logger.handlers.clear()
    logger.addHandler(handler)
    if logger_name is not None:
        logger.propagate = False

    return logger


def get_logger(name: str) -> logging.Logger:
    """Return a named standard library logger.

    Args:
        name: Hierarchical logger name (typically ``__name__``).

    Returns:
        The corresponding :class:`logging.Logger`.
    """
    return logging.getLogger(name)
