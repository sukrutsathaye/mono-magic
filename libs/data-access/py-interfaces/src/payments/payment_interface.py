"""Vendor-agnostic payments DTOs, Protocol, and abstract base class."""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Mapping
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any, Protocol, runtime_checkable

from pydantic import BaseModel, ConfigDict, Field, field_validator

from ..common import DataAccessError, Result


class Money(BaseModel):
    """Immutable monetary amount represented in integer minor units (e.g., cents)."""

    model_config = ConfigDict(frozen=True)

    amount_minor: int = Field(
        ...,
        ge=0,
        description="Non-negative monetary amount in the currency's smallest minor unit.",
    )
    currency: str = Field(
        ...,
        min_length=3,
        max_length=3,
        pattern=r"^[A-Z]{3}$",
        description="Three-letter uppercase ISO 4217 currency code (e.g., 'USD').",
    )

    @field_validator("currency", mode="before")
    @classmethod
    def _normalize_currency(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip().upper()
        return value


class PaymentStatus(StrEnum):
    """Lifecycle status of a payment intent."""

    REQUIRES_PAYMENT_METHOD = "requires_payment_method"
    REQUIRES_CONFIRMATION = "requires_confirmation"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    CANCELED = "canceled"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class PaymentIntent(BaseModel):
    """Immutable payment intent record tracked across payment providers."""

    model_config = ConfigDict(frozen=True)

    id: str = Field(..., min_length=1, description="Provider-assigned payment intent ID.")
    amount: Money = Field(..., description="Authorized or captured monetary amount.")
    status: PaymentStatus = Field(..., description="Current lifecycle status.")
    customer_id: str | None = Field(default=None, description="Optional customer identifier.")
    client_secret: str | None = Field(
        default=None,
        description="Optional client confirmation secret for frontend SDK handoff.",
    )
    description: str | None = Field(default=None, description="Optional payment description.")
    metadata: dict[str, str] = Field(
        default_factory=dict,
        description="Custom key/value metadata attached to the intent.",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="UTC timestamp when the intent was created.",
    )
    updated_at: datetime | None = Field(
        default=None,
        description="UTC timestamp when the payment intent was last updated.",
    )


@runtime_checkable
class PaymentProvider(Protocol):
    """Structural capability contract for payment processing providers."""

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
        ...

    async def confirm_payment_intent(
        self,
        intent_id: str,
        *,
        payment_method_id: str | None = None,
    ) -> Result[PaymentIntent, DataAccessError]:
        """Confirm and capture/authorize an existing payment intent."""
        ...

    async def get_payment_intent(
        self,
        intent_id: str,
    ) -> Result[PaymentIntent, DataAccessError]:
        """Fetch an existing payment intent by ID, or ``Err(NOT_FOUND)``."""
        ...

    async def refund_payment(
        self,
        intent_id: str,
        *,
        amount_minor: int | None = None,
        reason: str | None = None,
    ) -> Result[PaymentIntent, DataAccessError]:
        """Issue a full or partial refund against a succeeded payment intent."""
        ...


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
