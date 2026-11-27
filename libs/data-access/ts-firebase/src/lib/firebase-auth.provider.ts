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
import { normalizeFirebaseError } from './firebase-error.js';
import type {
  FirebaseAuthClientLike,
  FirebaseServicesLike,
  FirebaseUserLike,
} from './firebase-types.js';

function mapFirebaseUserToClaims(user: FirebaseUserLike): UserClaims {
  return {
    userId: user.uid,
    email: user.email ?? undefined,
    displayName: user.displayName ?? undefined,
    roles: user.roles && user.roles.length > 0 ? user.roles : ['authenticated'],
    customClaims: user.customClaims,
  };
}

async function mapFirebaseUserToSession(
  user: FirebaseUserLike,
  forceRefresh = false,
): Promise<AuthSession> {
  const accessToken = await user.getIdToken(forceRefresh);
  return {
    accessToken,
    refreshToken: user.refreshToken,
    expiresAtEpochMs: Date.now() + 3600 * 1000,
    user: mapFirebaseUserToClaims(user),
  };
}

/**
 * Concrete {@link BaseAuthProvider} implementation backed by Firebase Authentication,
 * opting into Google ({@link IGoogleAuthProvider}) and GitHub ({@link IGitHubAuthProvider})
 * social logins.
 */
export class FirebaseAuthProvider
  extends BaseAuthProvider
  implements IGoogleAuthProvider, IGitHubAuthProvider
{
  private readonly auth: FirebaseAuthClientLike;

  /**
   * Creates a new {@link FirebaseAuthProvider}.
   */
  public constructor(client: FirebaseServicesLike | { readonly auth: FirebaseAuthClientLike }) {
    super();
    this.auth = client.auth;
  }

  /**
   * Signs in an existing user using email and password via Firebase Auth.
   */
  public async signInWithEmail(
    input: SignInWithEmailInput,
  ): Promise<Result<AuthSession, DataAccessError>> {
    try {
      const credential = await this.auth.signInWithEmailAndPassword(input.email, input.password);
      const session = await mapFirebaseUserToSession(credential.user);
      return ok(session);
    } catch (cause) {
      return err(normalizeFirebaseError(cause, 'Firebase email sign-in failed'));
    }
  }

  /**
   * Registers a new user account using email and password via Firebase Auth.
   */
  public async signUpWithEmail(
    input: SignUpWithEmailInput,
  ): Promise<Result<AuthSession, DataAccessError>> {
    try {
      const credential = await this.auth.createUserWithEmailAndPassword(
        input.email,
        input.password,
        input.displayName,
      );
      const session = await mapFirebaseUserToSession(credential.user);
      return ok(session);
    } catch (cause) {
      return err(normalizeFirebaseError(cause, 'Firebase email sign-up failed'));
    }
  }

  /**
   * Initiates or completes federated OAuth/OIDC sign-in via Firebase Auth.
   */
  public async signInWithOAuth(
    provider: OAuthProvider,
    options?: Readonly<Record<string, unknown>>,
  ): Promise<Result<AuthSession, DataAccessError>> {
    try {
      const credential = await this.auth.signInWithOAuthProvider(provider, options);
      const session = await mapFirebaseUserToSession(credential.user);
      return ok(session);
    } catch (cause) {
      return err(normalizeFirebaseError(cause, 'Firebase OAuth sign-in failed'));
    }
  }

  /**
   * Signs in with Google via Firebase OAuth.
   */
  public signInWithGoogle(
    options?: SocialSignInOptions,
  ): Promise<Result<AuthSession, DataAccessError>> {
    return this.signInWithOAuth('google', options as Readonly<Record<string, unknown>> | undefined);
  }

  /**
   * Signs in with GitHub via Firebase OAuth.
   */
  public signInWithGitHub(
    options?: SocialSignInOptions,
  ): Promise<Result<AuthSession, DataAccessError>> {
    return this.signInWithOAuth('github', options as Readonly<Record<string, unknown>> | undefined);
  }

  /**
   * Signs out the active Firebase user session.
   */
  public async signOut(): Promise<Result<void, DataAccessError>> {
    try {
      await this.auth.signOut();
      return ok(undefined);
    } catch (cause) {
      return err(normalizeFirebaseError(cause, 'Firebase sign-out failed'));
    }
  }

  /**
   * Retrieves the current active Firebase session, or `null` if unauthenticated.
   */
  public async getCurrentSession(): Promise<Result<AuthSession | null, DataAccessError>> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        return ok(null);
      }
      const session = await mapFirebaseUserToSession(currentUser);
      return ok(session);
    } catch (cause) {
      return err(normalizeFirebaseError(cause, 'Failed to get Firebase session'));
    }
  }

  /**
   * Refreshes the active Firebase ID token.
   */
  public async refreshToken(
    refreshToken?: string,
  ): Promise<Result<AuthSession, DataAccessError>> {
    try {
      if (this.auth.refreshIdToken) {
        const refreshed = await this.auth.refreshIdToken(refreshToken);
        return ok({
          accessToken: refreshed.idToken,
          refreshToken: refreshed.refreshToken,
          expiresAtEpochMs: Date.now() + refreshed.expiresInSeconds * 1000,
          user: mapFirebaseUserToClaims(refreshed.user),
        });
      }
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        return err(
          createDataAccessError('UNAUTHORIZED', 'No authenticated Firebase user to refresh'),
        );
      }
      const session = await mapFirebaseUserToSession(currentUser, true);
      return ok(session);
    } catch (cause) {
      return err(normalizeFirebaseError(cause, 'Failed to refresh Firebase ID token'));
    }
  }

  /**
   * Verifies a Firebase ID token and extracts {@link UserClaims}.
   */
  public async verifyToken(
    accessToken: string,
  ): Promise<Result<UserClaims, DataAccessError>> {
    if (!accessToken || accessToken.trim().length === 0) {
      return err(createDataAccessError('VALIDATION', 'ID token must not be empty'));
    }
    try {
      const decoded = await this.auth.verifyIdToken(accessToken);
      return ok({
        userId: decoded.uid,
        email: decoded.email,
        displayName: decoded.name,
        roles: decoded.roles && decoded.roles.length > 0 ? decoded.roles : ['authenticated'],
        customClaims: decoded,
      });
    } catch (cause) {
      return err(normalizeFirebaseError(cause, 'Firebase ID token verification failed'));
    }
  }

  /**
   * Subscribes to Firebase auth state changes and returns an unsubscribe callback.
   */
  public onAuthStateChanged(listener: (session: AuthSession | null) => void): () => void {
    return this.auth.onAuthStateChanged((user) => {
      if (!user) {
        listener(null);
        return;
      }
      void mapFirebaseUserToSession(user).then((session) => {
        listener(session);
      });
    });
  }
}
