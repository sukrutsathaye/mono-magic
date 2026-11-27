import {
  BaseAuthProvider,
  createDataAccessError,
  type AuthSession,
  type DataAccessError,
  type IGitHubAuthProvider,
  type IGoogleAuthProvider,
  type OAuthProvider,
  type SignInWithEmailInput,
  type SignUpWithEmailInput,
  type SocialSignInOptions,
  type UserClaims,
} from '@mono-magic/data-access-ts-interfaces';
import { err, ok, type Result } from '@mono-magic/utils-ts-core';
import { normalizeSupabaseError } from './supabase-error.js';
import type {
  SupabaseAuthClientLike,
  SupabaseClientLike,
  SupabaseSessionLike,
  SupabaseUserLike,
} from './supabase-types.js';

function mapSupabaseUserToClaims(user: SupabaseUserLike): UserClaims {
  const userMeta = user.user_metadata ?? {};
  const appMeta = user.app_metadata ?? {};

  const displayName =
    typeof userMeta['display_name'] === 'string'
      ? userMeta['display_name']
      : typeof userMeta['full_name'] === 'string'
        ? userMeta['full_name']
        : undefined;

  const rawRoles = appMeta['roles'];
  const roles: ReadonlyArray<string> = Array.isArray(rawRoles)
    ? rawRoles.filter((r): r is string => typeof r === 'string')
    : typeof user.role === 'string' && user.role.length > 0
      ? [user.role]
      : ['authenticated'];

  return {
    userId: user.id,
    email: user.email,
    displayName,
    roles,
    customClaims: {
      ...userMeta,
      ...appMeta,
    },
  };
}

function mapSupabaseSession(session: SupabaseSessionLike): AuthSession {
  const expiresAtEpochMs =
    session.expires_at !== undefined
      ? session.expires_at * 1000
      : Date.now() + (session.expires_in ?? 3600) * 1000;

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAtEpochMs,
    user: mapSupabaseUserToClaims(session.user),
  };
}

/**
 * Concrete {@link BaseAuthProvider} implementation backed by a Supabase GoTrue client,
 * opting into Google ({@link IGoogleAuthProvider}) and GitHub ({@link IGitHubAuthProvider})
 * social logins.
 */
export class SupabaseAuthProvider
  extends BaseAuthProvider
  implements IGoogleAuthProvider, IGitHubAuthProvider
{
  private readonly auth: SupabaseAuthClientLike;

  /**
   * Creates a new {@link SupabaseAuthProvider}.
   */
  public constructor(client: SupabaseClientLike | { readonly auth: SupabaseAuthClientLike }) {
    super();
    this.auth = client.auth;
  }

  /**
   * Signs in an existing user using email and password via Supabase GoTrue.
   */
  public async signInWithEmail(
    input: SignInWithEmailInput,
  ): Promise<Result<AuthSession, DataAccessError>> {
    try {
      const response = await this.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (response.error) {
        return err(normalizeSupabaseError(response.error, 'Supabase sign-in failed'));
      }
      if (!response.data.session) {
        return err(
          createDataAccessError('UNAUTHORIZED', 'No session returned after Supabase sign-in'),
        );
      }
      return ok(mapSupabaseSession(response.data.session));
    } catch (cause) {
      return err(normalizeSupabaseError(cause, 'Supabase sign-in failed'));
    }
  }

  /**
   * Registers a new user account using email and password via Supabase GoTrue.
   */
  public async signUpWithEmail(
    input: SignUpWithEmailInput,
  ): Promise<Result<AuthSession, DataAccessError>> {
    try {
      const response = await this.auth.signUp({
        email: input.email,
        password: input.password,
        options: input.displayName ? { data: { display_name: input.displayName } } : undefined,
      });
      if (response.error) {
        return err(normalizeSupabaseError(response.error, 'Supabase sign-up failed'));
      }
      if (!response.data.session) {
        return err(
          createDataAccessError('UNAUTHORIZED', 'No active session returned after sign-up'),
        );
      }
      return ok(mapSupabaseSession(response.data.session));
    } catch (cause) {
      return err(normalizeSupabaseError(cause, 'Supabase sign-up failed'));
    }
  }

  /**
   * Initiates or completes federated OAuth/OIDC sign-in via Supabase GoTrue.
   */
  public async signInWithOAuth(
    provider: OAuthProvider,
    options?: Readonly<Record<string, unknown>>,
  ): Promise<Result<AuthSession, DataAccessError>> {
    try {
      const response = await this.auth.signInWithOAuth({
        provider,
        options,
      });
      if (response.error) {
        return err(normalizeSupabaseError(response.error, 'Supabase OAuth sign-in failed'));
      }
      if (response.data.session) {
        return ok(mapSupabaseSession(response.data.session));
      }
      const sessionRes = await this.auth.getSession();
      if (sessionRes.error) {
        return err(normalizeSupabaseError(sessionRes.error, 'Supabase OAuth session fetch failed'));
      }
      if (!sessionRes.data.session) {
        return err(
          createDataAccessError(
            'UNAUTHORIZED',
            'OAuth flow initiated; no active session available yet',
          ),
        );
      }
      return ok(mapSupabaseSession(sessionRes.data.session));
    } catch (cause) {
      return err(normalizeSupabaseError(cause, 'Supabase OAuth sign-in failed'));
    }
  }

  /**
   * Signs in with Google via Supabase GoTrue OAuth.
   */
  public signInWithGoogle(
    options?: SocialSignInOptions,
  ): Promise<Result<AuthSession, DataAccessError>> {
    return this.signInWithOAuth('google', options as Readonly<Record<string, unknown>> | undefined);
  }

  /**
   * Signs in with GitHub via Supabase GoTrue OAuth.
   */
  public signInWithGitHub(
    options?: SocialSignInOptions,
  ): Promise<Result<AuthSession, DataAccessError>> {
    return this.signInWithOAuth('github', options as Readonly<Record<string, unknown>> | undefined);
  }

  /**
   * Signs out the active Supabase session.
   */
  public async signOut(): Promise<Result<void, DataAccessError>> {
    try {
      const response = await this.auth.signOut();
      if (response.error) {
        return err(normalizeSupabaseError(response.error, 'Supabase sign-out failed'));
      }
      return ok(undefined);
    } catch (cause) {
      return err(normalizeSupabaseError(cause, 'Supabase sign-out failed'));
    }
  }

  /**
   * Retrieves the current active Supabase session, or `null` if unauthenticated.
   */
  public async getCurrentSession(): Promise<Result<AuthSession | null, DataAccessError>> {
    try {
      const response = await this.auth.getSession();
      if (response.error) {
        return err(normalizeSupabaseError(response.error, 'Failed to get Supabase session'));
      }
      return ok(response.data.session ? mapSupabaseSession(response.data.session) : null);
    } catch (cause) {
      return err(normalizeSupabaseError(cause, 'Failed to get Supabase session'));
    }
  }

  /**
   * Refreshes the active Supabase session using an optional refresh token.
   */
  public async refreshToken(
    refreshToken?: string,
  ): Promise<Result<AuthSession, DataAccessError>> {
    try {
      const response = await this.auth.refreshSession(
        refreshToken ? { refresh_token: refreshToken } : undefined,
      );
      if (response.error) {
        return err(normalizeSupabaseError(response.error, 'Failed to refresh Supabase token'));
      }
      if (!response.data.session) {
        return err(
          createDataAccessError('UNAUTHORIZED', 'No session returned when refreshing token'),
        );
      }
      return ok(mapSupabaseSession(response.data.session));
    } catch (cause) {
      return err(normalizeSupabaseError(cause, 'Failed to refresh Supabase token'));
    }
  }

  /**
   * Verifies an access token against Supabase GoTrue and extracts {@link UserClaims}.
   */
  public async verifyToken(
    accessToken: string,
  ): Promise<Result<UserClaims, DataAccessError>> {
    if (!accessToken || accessToken.trim().length === 0) {
      return err(createDataAccessError('VALIDATION', 'Access token must not be empty'));
    }
    try {
      const response = await this.auth.getUser(accessToken);
      if (response.error) {
        return err(normalizeSupabaseError(response.error, 'Supabase token verification failed'));
      }
      if (!response.data.user) {
        return err(createDataAccessError('UNAUTHORIZED', 'Invalid or expired access token'));
      }
      return ok(mapSupabaseUserToClaims(response.data.user));
    } catch (cause) {
      return err(normalizeSupabaseError(cause, 'Supabase token verification failed'));
    }
  }

  /**
   * Subscribes to Supabase auth state changes and returns an unsubscribe callback.
   */
  public onAuthStateChanged(listener: (session: AuthSession | null) => void): () => void {
    const { data } = this.auth.onAuthStateChange((_event, session) => {
      listener(session ? mapSupabaseSession(session) : null);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }
}
