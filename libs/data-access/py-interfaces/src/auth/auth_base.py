"""Abstract base classes for concrete authentication provider implementations."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ..common import DataAccessError, Result
from .auth_interface import AuthSession, OAuthProvider, UserClaims


class BaseAuthProvider(ABC):
    """Abstract base class for concrete ``AuthProvider`` adapter implementations.

    Kept intentionally minimal so non-social providers can extend it without
    implementing unused social login methods.
    """

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


class GoogleAuthMixin(BaseAuthProvider):
    """Opt-in Template Method mixin adding Google sign-in via ``sign_in_with_oauth``."""

    async def sign_in_with_google(
        self,
        *,
        redirect_uri: str | None = None,
        code: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        """Authenticate with Google, delegating to ``sign_in_with_oauth`` by default."""
        return await self.sign_in_with_oauth(
            OAuthProvider.GOOGLE,
            redirect_uri=redirect_uri,
            code=code,
        )


class GitHubAuthMixin(BaseAuthProvider):
    """Opt-in Template Method mixin adding GitHub sign-in via ``sign_in_with_oauth``."""

    async def sign_in_with_github(
        self,
        *,
        redirect_uri: str | None = None,
        code: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        """Authenticate with GitHub, delegating to ``sign_in_with_oauth`` by default."""
        return await self.sign_in_with_oauth(
            OAuthProvider.GITHUB,
            redirect_uri=redirect_uri,
            code=code,
        )


class AppleAuthMixin(BaseAuthProvider):
    """Opt-in Template Method mixin adding Apple sign-in via ``sign_in_with_oauth``."""

    async def sign_in_with_apple(
        self,
        *,
        redirect_uri: str | None = None,
        code: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        """Authenticate with Apple, delegating to ``sign_in_with_oauth`` by default."""
        return await self.sign_in_with_oauth(
            OAuthProvider.APPLE,
            redirect_uri=redirect_uri,
            code=code,
        )


class MicrosoftAuthMixin(BaseAuthProvider):
    """Opt-in Template Method mixin adding Microsoft sign-in via ``sign_in_with_oauth``."""

    async def sign_in_with_microsoft(
        self,
        *,
        redirect_uri: str | None = None,
        code: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        """Authenticate with Microsoft, delegating to ``sign_in_with_oauth`` by default."""
        return await self.sign_in_with_oauth(
            OAuthProvider.MICROSOFT,
            redirect_uri=redirect_uri,
            code=code,
        )


class FacebookAuthMixin(BaseAuthProvider):
    """Opt-in Template Method mixin adding Facebook sign-in via ``sign_in_with_oauth``."""

    async def sign_in_with_facebook(
        self,
        *,
        redirect_uri: str | None = None,
        code: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        """Authenticate with Facebook, delegating to ``sign_in_with_oauth`` by default."""
        return await self.sign_in_with_oauth(
            OAuthProvider.FACEBOOK,
            redirect_uri=redirect_uri,
            code=code,
        )


class TwitterAuthMixin(BaseAuthProvider):
    """Opt-in Template Method mixin adding X (Twitter) sign-in via ``sign_in_with_oauth``."""

    async def sign_in_with_twitter(
        self,
        *,
        redirect_uri: str | None = None,
        code: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        """Authenticate with X (Twitter), delegating to ``sign_in_with_oauth`` by default."""
        return await self.sign_in_with_oauth(
            OAuthProvider.TWITTER,
            redirect_uri=redirect_uri,
            code=code,
        )


class DiscordAuthMixin(BaseAuthProvider):
    """Opt-in Template Method mixin adding Discord sign-in via ``sign_in_with_oauth``."""

    async def sign_in_with_discord(
        self,
        *,
        redirect_uri: str | None = None,
        code: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        """Authenticate with Discord, delegating to ``sign_in_with_oauth`` by default."""
        return await self.sign_in_with_oauth(
            OAuthProvider.DISCORD,
            redirect_uri=redirect_uri,
            code=code,
        )


class LinkedInAuthMixin(BaseAuthProvider):
    """Opt-in Template Method mixin adding LinkedIn sign-in via ``sign_in_with_oauth``."""

    async def sign_in_with_linkedin(
        self,
        *,
        redirect_uri: str | None = None,
        code: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        """Authenticate with LinkedIn, delegating to ``sign_in_with_oauth`` by default."""
        return await self.sign_in_with_oauth(
            OAuthProvider.LINKEDIN,
            redirect_uri=redirect_uri,
            code=code,
        )


class GitLabAuthMixin(BaseAuthProvider):
    """Opt-in Template Method mixin adding GitLab sign-in via ``sign_in_with_oauth``."""

    async def sign_in_with_gitlab(
        self,
        *,
        redirect_uri: str | None = None,
        code: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        """Authenticate with GitLab, delegating to ``sign_in_with_oauth`` by default."""
        return await self.sign_in_with_oauth(
            OAuthProvider.GITLAB,
            redirect_uri=redirect_uri,
            code=code,
        )


class BaseSocialAuthProvider(
    GoogleAuthMixin,
    GitHubAuthMixin,
    AppleAuthMixin,
    MicrosoftAuthMixin,
    FacebookAuthMixin,
    TwitterAuthMixin,
    DiscordAuthMixin,
    LinkedInAuthMixin,
    GitLabAuthMixin,
):
    """Composite ``BaseAuthProvider`` subclass enabling all standard social logins.

    Providers that only need a subset (e.g., Google + GitHub) can compose individual
    mixins directly: ``class MyAuth(GoogleAuthMixin, GitHubAuthMixin): ...``.
    """
