import type { Result } from '@mono-magic/utils-ts-core';
import type { DataAccessError } from '../common/query.interface.js';

/**
 * Supported federated OAuth / OIDC identity providers.
 */
export type OAuthProvider =
  | 'google'
  | 'github'
  | 'apple'
  | 'microsoft'
  | 'facebook'
  | 'twitter'
  | 'discord'
  | 'linkedin'
  | 'gitlab'
  | 'keycloak'
  | 'oidc';

/**
 * Verified identity claims for an authenticated user.
 */
export interface UserClaims {
  /** Stable unique user identifier. */
  readonly userId: string;
  /** Primary email address if available. */
  readonly email?: string;
  /** Display name if available. */
  readonly displayName?: string;
  /** Assigned role identifiers. */
  readonly roles: ReadonlyArray<string>;
  /** Provider-specific custom claims. */
  readonly customClaims?: Readonly<Record<string, unknown>>;
}

/**
 * Active authentication session returned by an {@link IAuthProvider}.
 */
export interface AuthSession {
  /** Short-lived bearer access token. */
  readonly accessToken: string;
  /** Optional refresh token for obtaining new access tokens. */
  readonly refreshToken?: string;
  /** Expiration timestamp in Unix epoch milliseconds. */
  readonly expiresAtEpochMs: number;
  /** Authenticated user claims. */
  readonly user: UserClaims;
}

/**
 * Credentials for email/password sign-in.
 */
export interface SignInWithEmailInput {
  readonly email: string;
  readonly password: string;
}

/**
 * Registration payload for email/password sign-up.
 */
export interface SignUpWithEmailInput {
  readonly email: string;
  readonly password: string;
  readonly displayName?: string;
}

/**
 * Optional parameters for federated social sign-in flows.
 */
export interface SocialSignInOptions {
  /** Post-authentication redirect URL (used in redirect-based OAuth flows). */
  readonly redirectTo?: string;
  /** Additional OAuth scopes to request from the identity provider. */
  readonly scopes?: ReadonlyArray<string>;
  /** Extra provider-specific query parameters (e.g., `prompt`, `hd`, `nonce`). */
  readonly queryParams?: Readonly<Record<string, string>>;
}

/**
 * Contract for authentication and session management providers.
 */
export interface IAuthProvider {
  /** Signs in an existing user using email and password. */
  signInWithEmail(input: SignInWithEmailInput): Promise<Result<AuthSession, DataAccessError>>;
  /** Registers a new user account using email and password. */
  signUpWithEmail(input: SignUpWithEmailInput): Promise<Result<AuthSession, DataAccessError>>;
  /** Initiates or completes federated OAuth/OIDC sign-in. */
  signInWithOAuth(
    provider: OAuthProvider,
    options?: Readonly<Record<string, unknown>>,
  ): Promise<Result<AuthSession, DataAccessError>>;
  /** Signs out the current session. */
  signOut(): Promise<Result<void, DataAccessError>>;
  /** Retrieves the current active session, or `null` if unauthenticated. */
  getCurrentSession(): Promise<Result<AuthSession | null, DataAccessError>>;
  /** Refreshes the active session using a refresh token. */
  refreshToken(refreshToken?: string): Promise<Result<AuthSession, DataAccessError>>;
  /** Verifies an access token and extracts {@link UserClaims}. */
  verifyToken(accessToken: string): Promise<Result<UserClaims, DataAccessError>>;
  /** Subscribes to authentication session changes and returns an unsubscribe callback. */
  onAuthStateChanged(listener: (session: AuthSession | null) => void): () => void;
}

/**
 * Segregated capability contract for Google social sign-in.
 */
export interface IGoogleAuthProvider {
  /** Initiates or completes sign-in with Google. */
  signInWithGoogle(options?: SocialSignInOptions): Promise<Result<AuthSession, DataAccessError>>;
}

/**
 * Segregated capability contract for GitHub social sign-in.
 */
export interface IGitHubAuthProvider {
  /** Initiates or completes sign-in with GitHub. */
  signInWithGitHub(options?: SocialSignInOptions): Promise<Result<AuthSession, DataAccessError>>;
}

/**
 * Segregated capability contract for Apple social sign-in.
 */
export interface IAppleAuthProvider {
  /** Initiates or completes sign-in with Apple. */
  signInWithApple(options?: SocialSignInOptions): Promise<Result<AuthSession, DataAccessError>>;
}

/**
 * Segregated capability contract for Microsoft social sign-in.
 */
export interface IMicrosoftAuthProvider {
  /** Initiates or completes sign-in with Microsoft. */
  signInWithMicrosoft(options?: SocialSignInOptions): Promise<Result<AuthSession, DataAccessError>>;
}

/**
 * Segregated capability contract for Facebook (Meta) social sign-in.
 */
export interface IFacebookAuthProvider {
  /** Initiates or completes sign-in with Facebook. */
  signInWithFacebook(options?: SocialSignInOptions): Promise<Result<AuthSession, DataAccessError>>;
}

/**
 * Segregated capability contract for X (Twitter) social sign-in.
 */
export interface ITwitterAuthProvider {
  /** Initiates or completes sign-in with X (Twitter). */
  signInWithTwitter(options?: SocialSignInOptions): Promise<Result<AuthSession, DataAccessError>>;
}

/**
 * Segregated capability contract for Discord social sign-in.
 */
export interface IDiscordAuthProvider {
  /** Initiates or completes sign-in with Discord. */
  signInWithDiscord(options?: SocialSignInOptions): Promise<Result<AuthSession, DataAccessError>>;
}

/**
 * Segregated capability contract for LinkedIn social sign-in.
 */
export interface ILinkedInAuthProvider {
  /** Initiates or completes sign-in with LinkedIn. */
  signInWithLinkedIn(options?: SocialSignInOptions): Promise<Result<AuthSession, DataAccessError>>;
}

/**
 * Segregated capability contract for GitLab social sign-in.
 */
export interface IGitLabAuthProvider {
  /** Initiates or completes sign-in with GitLab. */
  signInWithGitLab(options?: SocialSignInOptions): Promise<Result<AuthSession, DataAccessError>>;
}

/**
 * Composite social capability contract for providers supporting all standard social logins.
 *
 * Providers that only support a subset (e.g., Google + GitHub only) should implement the
 * individual interfaces ({@link IGoogleAuthProvider}, {@link IGitHubAuthProvider}, etc.)
 * directly instead of this composite interface.
 */
export interface ISocialAuthProvider
  extends IGoogleAuthProvider,
    IGitHubAuthProvider,
    IAppleAuthProvider,
    IMicrosoftAuthProvider,
    IFacebookAuthProvider,
    ITwitterAuthProvider,
    IDiscordAuthProvider,
    ILinkedInAuthProvider,
    IGitLabAuthProvider {}

