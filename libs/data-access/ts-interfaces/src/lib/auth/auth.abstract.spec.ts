import { ok, type Result } from '@mono-magic/utils-ts-core';
import { describe, expect, it, vi } from 'vitest';
import type { DataAccessError } from '../common/query.interface.js';
import {
  BaseAuthProvider,
  BaseSocialAuthProvider,
  hasAppleAuth,
  hasDiscordAuth,
  hasFacebookAuth,
  hasGitHubAuth,
  hasGitLabAuth,
  hasGoogleAuth,
  hasLinkedInAuth,
  hasMicrosoftAuth,
  hasTwitterAuth,
  isSocialAuthProvider,
} from './auth.abstract.js';
import type {
  AuthSession,
  IGoogleAuthProvider,
  OAuthProvider,
  SignInWithEmailInput,
  SignUpWithEmailInput,
  SocialSignInOptions,
  UserClaims,
} from './auth.interface.js';

const MOCK_SESSION: AuthSession = {
  accessToken: 'tok-social',
  expiresAtEpochMs: Date.now() + 3600_000,
  user: {
    userId: 'u-1',
    email: 'social@mono-magic.local',
    roles: ['authenticated'],
  },
};

class MinimalEmailAuthProvider extends BaseAuthProvider {
  public async signInWithEmail(_input: SignInWithEmailInput) {
    return ok(MOCK_SESSION);
  }
  public async signUpWithEmail(_input: SignUpWithEmailInput) {
    return ok(MOCK_SESSION);
  }
  public async signInWithOAuth(_provider: OAuthProvider) {
    return ok(MOCK_SESSION);
  }
  public async signOut() {
    return ok(undefined);
  }
  public async getCurrentSession() {
    return ok(MOCK_SESSION);
  }
  public async refreshToken() {
    return ok(MOCK_SESSION);
  }
  public async verifyToken(): Promise<Result<UserClaims, DataAccessError>> {
    return ok(MOCK_SESSION.user);
  }
  public onAuthStateChanged() {
    return () => undefined;
  }
}

class DemoSocialAuthProvider extends BaseSocialAuthProvider {
  public readonly oauthSpy = vi.fn(
    async (_provider: OAuthProvider, _options?: Readonly<Record<string, unknown>>) =>
      ok(MOCK_SESSION),
  );

  public async signInWithEmail(_input: SignInWithEmailInput) {
    return ok(MOCK_SESSION);
  }
  public async signUpWithEmail(_input: SignUpWithEmailInput) {
    return ok(MOCK_SESSION);
  }
  public signInWithOAuth(
    provider: OAuthProvider,
    options?: Readonly<Record<string, unknown>>,
  ): Promise<Result<AuthSession, DataAccessError>> {
    return this.oauthSpy(provider, options);
  }
  public async signOut() {
    return ok(undefined);
  }
  public async getCurrentSession() {
    return ok(MOCK_SESSION);
  }
  public async refreshToken() {
    return ok(MOCK_SESSION);
  }
  public async verifyToken(): Promise<Result<UserClaims, DataAccessError>> {
    return ok(MOCK_SESSION.user);
  }
  public onAuthStateChanged() {
    return () => undefined;
  }
}

describe('BaseSocialAuthProvider & isSocialAuthProvider', () => {
  it('distinguishes social-capable providers from minimal BaseAuthProvider implementations', () => {
    const minimal = new MinimalEmailAuthProvider();
    const social = new DemoSocialAuthProvider();

    expect(isSocialAuthProvider(minimal)).toBe(false);
    expect(isSocialAuthProvider(social)).toBe(true);
  });

  it('delegates all standard social sign-in methods to signInWithOAuth', async () => {
    const social = new DemoSocialAuthProvider();
    const opts = { redirectTo: 'https://app.mono-magic.local/callback', scopes: ['email'] };

    const results = await Promise.all([
      social.signInWithGoogle(opts),
      social.signInWithGitHub(opts),
      social.signInWithApple(opts),
      social.signInWithMicrosoft(opts),
      social.signInWithFacebook(opts),
      social.signInWithTwitter(opts),
      social.signInWithDiscord(opts),
      social.signInWithLinkedIn(opts),
      social.signInWithGitLab(opts),
    ]);

    for (const res of results) {
      expect(res.ok).toBe(true);
    }

    expect(social.oauthSpy).toHaveBeenNthCalledWith(1, 'google', opts);
    expect(social.oauthSpy).toHaveBeenNthCalledWith(2, 'github', opts);
    expect(social.oauthSpy).toHaveBeenNthCalledWith(3, 'apple', opts);
    expect(social.oauthSpy).toHaveBeenNthCalledWith(4, 'microsoft', opts);
    expect(social.oauthSpy).toHaveBeenNthCalledWith(5, 'facebook', opts);
    expect(social.oauthSpy).toHaveBeenNthCalledWith(6, 'twitter', opts);
    expect(social.oauthSpy).toHaveBeenNthCalledWith(7, 'discord', opts);
    expect(social.oauthSpy).toHaveBeenNthCalledWith(8, 'linkedin', opts);
    expect(social.oauthSpy).toHaveBeenNthCalledWith(9, 'gitlab', opts);
  });

  it('allows a provider to opt into only a subset of social logins (e.g., Google only)', async () => {
    class GoogleOnlyAuthProvider extends MinimalEmailAuthProvider implements IGoogleAuthProvider {
      public signInWithGoogle(_options?: SocialSignInOptions) {
        return this.signInWithOAuth('google');
      }
    }

    const googleOnly = new GoogleOnlyAuthProvider();

    expect(hasGoogleAuth(googleOnly)).toBe(true);
    expect(hasGitHubAuth(googleOnly)).toBe(false);
    expect(hasAppleAuth(googleOnly)).toBe(false);
    expect(hasMicrosoftAuth(googleOnly)).toBe(false);
    expect(hasFacebookAuth(googleOnly)).toBe(false);
    expect(hasTwitterAuth(googleOnly)).toBe(false);
    expect(hasDiscordAuth(googleOnly)).toBe(false);
    expect(hasLinkedInAuth(googleOnly)).toBe(false);
    expect(hasGitLabAuth(googleOnly)).toBe(false);
    expect(isSocialAuthProvider(googleOnly)).toBe(false);

    const res = await googleOnly.signInWithGoogle();
    expect(res.ok).toBe(true);
  });
});
