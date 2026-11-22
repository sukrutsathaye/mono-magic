"""Vendor-agnostic realtime pub/sub and presence DTOs, Protocol, and abstract base class."""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Awaitable, Callable
from datetime import UTC, datetime
from typing import Any, Protocol, runtime_checkable

from pydantic import BaseModel, ConfigDict, Field

from .common import DataAccessError, Result


class RealtimeEnvelope(BaseModel):
    """Immutable message envelope delivered across realtime channels."""

    model_config = ConfigDict(frozen=True)

    channel: str = Field(..., min_length=1, description="Logical channel or topic name.")
    event: str = Field(..., min_length=1, description="Event name within the channel.")
    payload: dict[str, Any] = Field(
        default_factory=dict,
        description="JSON-serializable event payload.",
    )
    sender_id: str | None = Field(default=None, description="Optional publisher identifier.")
    message_id: str | None = Field(default=None, description="Optional unique message ID.")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="UTC timestamp when the envelope was published.",
    )
    metadata: dict[str, str] = Field(
        default_factory=dict,
        description="Additional routing or tracing headers.",
    )


class PresenceState(BaseModel):
    """Immutable participant presence snapshot on a realtime channel."""

    model_config = ConfigDict(frozen=True)

    channel: str = Field(..., min_length=1, description="Channel identifier.")
    user_id: str = Field(..., min_length=1, description="Connected participant identifier.")
    status: str = Field(default="online", min_length=1, description="Presence state label.")
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional participant presence attributes.",
    )
    last_seen_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="UTC timestamp of the last presence heartbeat.",
    )


type RealtimeHandler = Callable[[RealtimeEnvelope], Awaitable[None]]
type UnsubscribeFn = Callable[[], Awaitable[None]]


@runtime_checkable
class RealtimeProvider(Protocol):
    """Structural capability contract for realtime pub/sub and presence providers."""

    async def publish(
        self,
        channel: str,
        event: str,
        payload: dict[str, Any],
        *,
        sender_id: str | None = None,
    ) -> Result[RealtimeEnvelope, DataAccessError]:
        """Publish an event envelope to ``channel``."""
        ...

    async def subscribe(
        self,
        channel: str,
        handler: RealtimeHandler,
    ) -> Result[UnsubscribeFn, DataAccessError]:
        """Register ``handler`` on ``channel`` and return an async unsubscribe callback."""
        ...

    async def presence(
        self,
        channel: str,
    ) -> Result[list[PresenceState], DataAccessError]:
        """Return active participant presence states currently on ``channel``."""
        ...


class BaseRealtimeProvider(ABC):
    """Abstract base class for concrete ``RealtimeProvider`` adapter implementations."""

    @abstractmethod
    async def publish(
        self,
        channel: str,
        event: str,
        payload: dict[str, Any],
        *,
        sender_id: str | None = None,
    ) -> Result[RealtimeEnvelope, DataAccessError]:
        """Publish an event envelope to ``channel``."""

    @abstractmethod
    async def subscribe(
        self,
        channel: str,
        handler: RealtimeHandler,
    ) -> Result[UnsubscribeFn, DataAccessError]:
        """Register ``handler`` on ``channel`` and return an async unsubscribe callback."""

    @abstractmethod
    async def presence(
        self,
        channel: str,
    ) -> Result[list[PresenceState], DataAccessError]:
        """Return active participant presence states currently on ``channel``."""
