import type { Result } from '@mono-magic/utils-ts-core';
import type { DataAccessError } from '../common/query.interface.js';

/**
 * Supported federated OAuth / OIDC identity providers.
 */
export type OAuthProvider = 'google' | 'github' | 'apple' | 'microsoft' | 'oidc';

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
 * Abstract base class for {@link IAuthProvider} implementations.
 */
export abstract class BaseAuthProvider implements IAuthProvider {
  public abstract signInWithEmail(
    input: SignInWithEmailInput,
  ): Promise<Result<AuthSession, DataAccessError>>;
  public abstract signUpWithEmail(
    input: SignUpWithEmailInput,
  ): Promise<Result<AuthSession, DataAccessError>>;
  public abstract signInWithOAuth(
    provider: OAuthProvider,
    options?: Readonly<Record<string, unknown>>,
  ): Promise<Result<AuthSession, DataAccessError>>;
  public abstract signOut(): Promise<Result<void, DataAccessError>>;
  public abstract getCurrentSession(): Promise<Result<AuthSession | null, DataAccessError>>;
  public abstract refreshToken(refreshToken?: string): Promise<Result<AuthSession, DataAccessError>>;
  public abstract verifyToken(accessToken: string): Promise<Result<UserClaims, DataAccessError>>;
  public abstract onAuthStateChanged(listener: (session: AuthSession | null) => void): () => void;
}
