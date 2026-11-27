"""Unit tests for BaseSocialAuthProvider and SocialAuthProvider Protocol."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest
from py_data_access_interfaces import (
    AppleAuthProvider,
    AuthSession,
    BaseAuthProvider,
    BaseSocialAuthProvider,
    DataAccessError,
    GitHubAuthMixin,
    GitHubAuthProvider,
    GoogleAuthMixin,
    GoogleAuthProvider,
    MicrosoftAuthProvider,
    OAuthProvider,
    Result,
    SocialAuthProvider,
    UserClaims,
    is_ok,
    ok,
)

_SESSION = AuthSession(
    access_token="tok-social",
    expires_at=datetime.now(UTC) + timedelta(hours=1),
    user=UserClaims(user_id="u-1", email="social@mono-magic.local", roles=["authenticated"]),
)


class _MinimalAuthProvider(BaseAuthProvider):
    async def sign_in_with_email(
        self, email: str, password: str
    ) -> Result[AuthSession, DataAccessError]:
        return ok(_SESSION)

    async def sign_up_with_email(
        self, email: str, password: str, *, display_name: str | None = None
    ) -> Result[AuthSession, DataAccessError]:
        return ok(_SESSION)

    async def sign_in_with_oauth(
        self,
        provider: OAuthProvider,
        *,
        redirect_uri: str | None = None,
        code: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        return ok(_SESSION)

    async def sign_out(self, access_token: str | None = None) -> Result[None, DataAccessError]:
        return ok(None)

    async def get_current_session(
        self, access_token: str | None = None
    ) -> Result[AuthSession | None, DataAccessError]:
        return ok(_SESSION)

    async def refresh_token(self, refresh_token: str) -> Result[AuthSession, DataAccessError]:
        return ok(_SESSION)

    async def verify_token(self, token: str) -> Result[UserClaims, DataAccessError]:
        return ok(_SESSION.user)


class _DemoSocialAuthProvider(BaseSocialAuthProvider):
    def __init__(self) -> None:
        self.calls: list[tuple[OAuthProvider, str | None, str | None]] = []

    async def sign_in_with_email(
        self, email: str, password: str
    ) -> Result[AuthSession, DataAccessError]:
        return ok(_SESSION)

    async def sign_up_with_email(
        self, email: str, password: str, *, display_name: str | None = None
    ) -> Result[AuthSession, DataAccessError]:
        return ok(_SESSION)

    async def sign_in_with_oauth(
        self,
        provider: OAuthProvider,
        *,
        redirect_uri: str | None = None,
        code: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        self.calls.append((provider, redirect_uri, code))
        return ok(_SESSION)

    async def sign_out(self, access_token: str | None = None) -> Result[None, DataAccessError]:
        return ok(None)

    async def get_current_session(
        self, access_token: str | None = None
    ) -> Result[AuthSession | None, DataAccessError]:
        return ok(_SESSION)

    async def refresh_token(self, refresh_token: str) -> Result[AuthSession, DataAccessError]:
        return ok(_SESSION)

    async def verify_token(self, token: str) -> Result[UserClaims, DataAccessError]:
        return ok(_SESSION.user)


def test_social_auth_protocol_distinguishes_minimal_from_social() -> None:
    """Minimal BaseAuthProvider does not satisfy SocialAuthProvider; BaseSocialAuthProvider does."""
    assert not isinstance(_MinimalAuthProvider(), SocialAuthProvider)
    assert isinstance(_DemoSocialAuthProvider(), SocialAuthProvider)


@pytest.mark.asyncio
async def test_base_social_auth_provider_delegates_to_oauth() -> None:
    """All standard social sign-in helpers delegate to sign_in_with_oauth."""
    provider = _DemoSocialAuthProvider()
    uri = "https://app.mono-magic.local/callback"

    assert is_ok(await provider.sign_in_with_google(redirect_uri=uri, code="c1"))
    assert is_ok(await provider.sign_in_with_github(redirect_uri=uri, code="c2"))
    assert is_ok(await provider.sign_in_with_apple(redirect_uri=uri, code="c3"))
    assert is_ok(await provider.sign_in_with_microsoft(redirect_uri=uri, code="c4"))
    assert is_ok(await provider.sign_in_with_facebook(redirect_uri=uri, code="c5"))
    assert is_ok(await provider.sign_in_with_twitter(redirect_uri=uri, code="c6"))
    assert is_ok(await provider.sign_in_with_discord(redirect_uri=uri, code="c7"))
    assert is_ok(await provider.sign_in_with_linkedin(redirect_uri=uri, code="c8"))
    assert is_ok(await provider.sign_in_with_gitlab(redirect_uri=uri, code="c9"))

    assert provider.calls == [
        (OAuthProvider.GOOGLE, uri, "c1"),
        (OAuthProvider.GITHUB, uri, "c2"),
        (OAuthProvider.APPLE, uri, "c3"),
        (OAuthProvider.MICROSOFT, uri, "c4"),
        (OAuthProvider.FACEBOOK, uri, "c5"),
        (OAuthProvider.TWITTER, uri, "c6"),
        (OAuthProvider.DISCORD, uri, "c7"),
        (OAuthProvider.LINKEDIN, uri, "c8"),
        (OAuthProvider.GITLAB, uri, "c9"),
    ]


@pytest.mark.asyncio
async def test_subset_social_mixins_avoid_forcing_unused_providers() -> None:
    """A provider composing only Google + GitHub mixins satisfies only those Protocols."""

    class _GoogleGitHubOnlyProvider(GoogleAuthMixin, GitHubAuthMixin, _MinimalAuthProvider):
        pass

    provider = _GoogleGitHubOnlyProvider()

    assert isinstance(provider, GoogleAuthProvider)
    assert isinstance(provider, GitHubAuthProvider)
    assert not isinstance(provider, AppleAuthProvider)
    assert not isinstance(provider, MicrosoftAuthProvider)
    assert not isinstance(provider, SocialAuthProvider)

    assert is_ok(await provider.sign_in_with_google())
    assert is_ok(await provider.sign_in_with_github())
