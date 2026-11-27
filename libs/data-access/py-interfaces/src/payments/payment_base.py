"""Abstract base class for concrete ``PaymentProvider`` adapter implementations."""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Mapping

from ..common import DataAccessError, Result
from .payment_interface import Money, PaymentIntent


class BasePaymentProvider(ABC):
    """Abstract base class for concrete ``PaymentProvider`` adapter implementations."""

    @abstractmethod
    async def create_payment_intent(
        self,
        amount: Money,
        *,
        customer_id: str | None = None,
        description: str | None = None,
        metadata: Mapping[str, str] | None = None,
        idempotency_key: str | None = None,
    ) -> Result[PaymentIntent, DataAccessError]:
        """Create a new payment intent for ``amount``."""

    @abstractmethod
    async def confirm_payment_intent(
        self,
        intent_id: str,
        *,
        payment_method_id: str | None = None,
    ) -> Result[PaymentIntent, DataAccessError]:
        """Confirm and capture/authorize an existing payment intent."""

    @abstractmethod
    async def get_payment_intent(
        self,
        intent_id: str,
    ) -> Result[PaymentIntent, DataAccessError]:
        """Fetch an existing payment intent by ID, or ``Err(NOT_FOUND)``."""

    @abstractmethod
    async def refund_payment(
        self,
        intent_id: str,
        *,
        amount_minor: int | None = None,
        reason: str | None = None,
    ) -> Result[PaymentIntent, DataAccessError]:
        """Issue a full or partial refund against a succeeded payment intent."""
