"""Vendor-agnostic authentication DTOs, Protocol, and abstract base class."""

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime
from enum import StrEnum
from typing import Any, Protocol, runtime_checkable

from pydantic import BaseModel, ConfigDict, Field

from .common import DataAccessError, Result


class OAuthProvider(StrEnum):
    """Supported federated OAuth2 / OIDC identity providers."""

    GOOGLE = "google"
    GITHUB = "github"
    APPLE = "apple"
    MICROSOFT = "microsoft"
    KEYCLOAK = "keycloak"
    OIDC = "oidc"


class UserClaims(BaseModel):
    """Normalized authenticated user identity and authorization claims."""

    model_config = ConfigDict(frozen=True)

    user_id: str = Field(..., min_length=1, description="Canonical unique subject identifier.")
    email: str | None = Field(default=None, description="Primary user email address.")
    email_verified: bool = Field(
        default=False,
        description="Whether the email address has been verified.",
    )
    display_name: str | None = Field(default=None, description="User display name.")
    avatar_url: str | None = Field(default=None, description="Profile avatar URL.")
    roles: list[str] = Field(
        default_factory=list,
        description="Assigned role identifiers (RBAC).",
    )
    tenant_id: str | None = Field(
        default=None,
        description="Optional multi-tenant organization or workspace identifier.",
    )
    custom_claims: dict[str, Any] = Field(
        default_factory=dict,
        description="Provider-agnostic custom identity metadata.",
    )


class AuthSession(BaseModel):
    """Immutable authenticated session envelope containing tokens and user claims."""

    model_config = ConfigDict(frozen=True)

    access_token: str = Field(..., min_length=1, description="Bearer access token.")
    refresh_token: str | None = Field(
        default=None,
        description="Optional refresh token for session renewal.",
    )
    token_type: str = Field(default="Bearer", min_length=1, description="Authorization scheme.")
    expires_at: datetime = Field(..., description="UTC timestamp when the access token expires.")
    user: UserClaims = Field(..., description="Authenticated user identity claims.")


@runtime_checkable
class AuthProvider(Protocol):
    """Structural capability contract for authentication and token lifecycle providers."""

    async def sign_in_with_email(
        self,
        email: str,
        password: str,
    ) -> Result[AuthSession, DataAccessError]:
        """Authenticate an existing user with email and password credentials."""
        ...

    async def sign_up_with_email(
        self,
        email: str,
        password: str,
        *,
        display_name: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        """Register a new user account with email and password credentials."""
        ...

    async def sign_in_with_oauth(
        self,
        provider: OAuthProvider,
        *,
        redirect_uri: str | None = None,
        code: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        """Authenticate or exchange an authorization code via an OAuth/OIDC provider."""
        ...

    async def sign_out(
        self,
        access_token: str | None = None,
    ) -> Result[None, DataAccessError]:
        """Revoke the active session or invalidate the supplied access token."""
        ...

    async def get_current_session(
        self,
        access_token: str | None = None,
    ) -> Result[AuthSession | None, DataAccessError]:
        """Retrieve the current session if authenticated, or ``Ok(None)`` otherwise."""
        ...

    async def refresh_token(
        self,
        refresh_token: str,
    ) -> Result[AuthSession, DataAccessError]:
        """Exchange a valid refresh token for a renewed ``AuthSession``."""
        ...

    async def verify_token(
        self,
        token: str,
    ) -> Result[UserClaims, DataAccessError]:
        """Validate an access token and return the normalized ``UserClaims``."""
        ...


class BaseAuthProvider(ABC):
    """Abstract base class for concrete ``AuthProvider`` adapter implementations."""

    @abstractmethod
    async def sign_in_with_email(
        self,
        email: str,
        password: str,
    ) -> Result[AuthSession, DataAccessError]:
        """Authenticate an existing user with email and password credentials."""

    @abstractmethod
    async def sign_up_with_email(
        self,
        email: str,
        password: str,
        *,
        display_name: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        """Register a new user account with email and password credentials."""

    @abstractmethod
    async def sign_in_with_oauth(
        self,
        provider: OAuthProvider,
        *,
        redirect_uri: str | None = None,
        code: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        """Authenticate or exchange an authorization code via an OAuth/OIDC provider."""

    @abstractmethod
    async def sign_out(
        self,
        access_token: str | None = None,
    ) -> Result[None, DataAccessError]:
        """Revoke the active session or invalidate the supplied access token."""

    @abstractmethod
    async def get_current_session(
        self,
        access_token: str | None = None,
    ) -> Result[AuthSession | None, DataAccessError]:
        """Retrieve the current session if authenticated, or ``Ok(None)`` otherwise."""

    @abstractmethod
    async def refresh_token(
        self,
        refresh_token: str,
    ) -> Result[AuthSession, DataAccessError]:
        """Exchange a valid refresh token for a renewed ``AuthSession``."""

    @abstractmethod
    async def verify_token(
        self,
        token: str,
    ) -> Result[UserClaims, DataAccessError]:
        """Validate an access token and return the normalized ``UserClaims``."""
