"""Abstract base class for concrete ``RealtimeProvider`` adapter implementations."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from ..common import DataAccessError, Result
from .realtime_interface import PresenceState, RealtimeEnvelope, RealtimeHandler, UnsubscribeFn


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
