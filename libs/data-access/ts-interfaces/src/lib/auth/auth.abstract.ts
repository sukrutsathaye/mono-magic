import type { Result } from '@mono-magic/utils-ts-core';
import type { DataAccessError } from '../common/query.interface.js';
import type {
  AuthSession,
  IAppleAuthProvider,
  IAuthProvider,
  IDiscordAuthProvider,
  IFacebookAuthProvider,
  IGitHubAuthProvider,
  IGitLabAuthProvider,
  IGoogleAuthProvider,
  ILinkedInAuthProvider,
  IMicrosoftAuthProvider,
  ISocialAuthProvider,
  ITwitterAuthProvider,
  OAuthProvider,
  SignInWithEmailInput,
  SignUpWithEmailInput,
  SocialSignInOptions,
  UserClaims,
} from './auth.interface.js';

/**
 * Abstract base class for {@link IAuthProvider} implementations.
 *
 * Kept intentionally minimal so non-social providers (e.g., email/password or JWT-only
 * services) can extend it without implementing unused social login methods.
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

/**
 * Open–Closed extension of {@link BaseAuthProvider} adding {@link ISocialAuthProvider}.
 *
 * Uses the Template Method pattern: each social method delegates to
 * {@link BaseAuthProvider.signInWithOAuth} by default while remaining overridable for
 * provider-specific SDK flows (e.g., native Google One Tap or Apple nonce handling).
 */
export abstract class BaseSocialAuthProvider
  extends BaseAuthProvider
  implements ISocialAuthProvider
{
  /** Signs in with Google, delegating to {@link signInWithOAuth} by default. */
  public signInWithGoogle(
    options?: SocialSignInOptions,
  ): Promise<Result<AuthSession, DataAccessError>> {
    return this.signInWithOAuth('google', options as Readonly<Record<string, unknown>> | undefined);
  }

  /** Signs in with GitHub, delegating to {@link signInWithOAuth} by default. */
  public signInWithGitHub(
    options?: SocialSignInOptions,
  ): Promise<Result<AuthSession, DataAccessError>> {
    return this.signInWithOAuth('github', options as Readonly<Record<string, unknown>> | undefined);
  }

  /** Signs in with Apple, delegating to {@link signInWithOAuth} by default. */
  public signInWithApple(
    options?: SocialSignInOptions,
  ): Promise<Result<AuthSession, DataAccessError>> {
    return this.signInWithOAuth('apple', options as Readonly<Record<string, unknown>> | undefined);
  }

  /** Signs in with Microsoft, delegating to {@link signInWithOAuth} by default. */
  public signInWithMicrosoft(
    options?: SocialSignInOptions,
  ): Promise<Result<AuthSession, DataAccessError>> {
    return this.signInWithOAuth(
      'microsoft',
      options as Readonly<Record<string, unknown>> | undefined,
    );
  }

  /** Signs in with Facebook, delegating to {@link signInWithOAuth} by default. */
  public signInWithFacebook(
    options?: SocialSignInOptions,
  ): Promise<Result<AuthSession, DataAccessError>> {
    return this.signInWithOAuth(
      'facebook',
      options as Readonly<Record<string, unknown>> | undefined,
    );
  }

  /** Signs in with X (Twitter), delegating to {@link signInWithOAuth} by default. */
  public signInWithTwitter(
    options?: SocialSignInOptions,
  ): Promise<Result<AuthSession, DataAccessError>> {
    return this.signInWithOAuth(
      'twitter',
      options as Readonly<Record<string, unknown>> | undefined,
    );
  }

  /** Signs in with Discord, delegating to {@link signInWithOAuth} by default. */
  public signInWithDiscord(
    options?: SocialSignInOptions,
  ): Promise<Result<AuthSession, DataAccessError>> {
    return this.signInWithOAuth(
      'discord',
      options as Readonly<Record<string, unknown>> | undefined,
    );
  }

  /** Signs in with LinkedIn, delegating to {@link signInWithOAuth} by default. */
  public signInWithLinkedIn(
    options?: SocialSignInOptions,
  ): Promise<Result<AuthSession, DataAccessError>> {
    return this.signInWithOAuth(
      'linkedin',
      options as Readonly<Record<string, unknown>> | undefined,
    );
  }

  /** Signs in with GitLab, delegating to {@link signInWithOAuth} by default. */
  public signInWithGitLab(
    options?: SocialSignInOptions,
  ): Promise<Result<AuthSession, DataAccessError>> {
    return this.signInWithOAuth(
      'gitlab',
      options as Readonly<Record<string, unknown>> | undefined,
    );
  }
}

/** Runtime type guard checking whether an {@link IAuthProvider} supports Google sign-in. */
export function hasGoogleAuth(
  provider: IAuthProvider,
): provider is IAuthProvider & IGoogleAuthProvider {
  return 'signInWithGoogle' in provider && typeof provider.signInWithGoogle === 'function';
}

/** Runtime type guard checking whether an {@link IAuthProvider} supports GitHub sign-in. */
export function hasGitHubAuth(
  provider: IAuthProvider,
): provider is IAuthProvider & IGitHubAuthProvider {
  return 'signInWithGitHub' in provider && typeof provider.signInWithGitHub === 'function';
}

/** Runtime type guard checking whether an {@link IAuthProvider} supports Apple sign-in. */
export function hasAppleAuth(
  provider: IAuthProvider,
): provider is IAuthProvider & IAppleAuthProvider {
  return 'signInWithApple' in provider && typeof provider.signInWithApple === 'function';
}

/** Runtime type guard checking whether an {@link IAuthProvider} supports Microsoft sign-in. */
export function hasMicrosoftAuth(
  provider: IAuthProvider,
): provider is IAuthProvider & IMicrosoftAuthProvider {
  return 'signInWithMicrosoft' in provider && typeof provider.signInWithMicrosoft === 'function';
}

/** Runtime type guard checking whether an {@link IAuthProvider} supports Facebook sign-in. */
export function hasFacebookAuth(
  provider: IAuthProvider,
): provider is IAuthProvider & IFacebookAuthProvider {
  return 'signInWithFacebook' in provider && typeof provider.signInWithFacebook === 'function';
}

/** Runtime type guard checking whether an {@link IAuthProvider} supports X (Twitter) sign-in. */
export function hasTwitterAuth(
  provider: IAuthProvider,
): provider is IAuthProvider & ITwitterAuthProvider {
  return 'signInWithTwitter' in provider && typeof provider.signInWithTwitter === 'function';
}

/** Runtime type guard checking whether an {@link IAuthProvider} supports Discord sign-in. */
export function hasDiscordAuth(
  provider: IAuthProvider,
): provider is IAuthProvider & IDiscordAuthProvider {
  return 'signInWithDiscord' in provider && typeof provider.signInWithDiscord === 'function';
}

/** Runtime type guard checking whether an {@link IAuthProvider} supports LinkedIn sign-in. */
export function hasLinkedInAuth(
  provider: IAuthProvider,
): provider is IAuthProvider & ILinkedInAuthProvider {
  return 'signInWithLinkedIn' in provider && typeof provider.signInWithLinkedIn === 'function';
}

/** Runtime type guard checking whether an {@link IAuthProvider} supports GitLab sign-in. */
export function hasGitLabAuth(
  provider: IAuthProvider,
): provider is IAuthProvider & IGitLabAuthProvider {
  return 'signInWithGitLab' in provider && typeof provider.signInWithGitLab === 'function';
}

/**
 * Runtime type guard checking whether an {@link IAuthProvider} implements the full
 * {@link ISocialAuthProvider} composite contract.
 */
export function isSocialAuthProvider(
  provider: IAuthProvider,
): provider is IAuthProvider & ISocialAuthProvider {
  return (
    hasGoogleAuth(provider) &&
    hasGitHubAuth(provider) &&
    hasAppleAuth(provider) &&
    hasMicrosoftAuth(provider) &&
    hasFacebookAuth(provider) &&
    hasTwitterAuth(provider) &&
    hasDiscordAuth(provider) &&
    hasLinkedInAuth(provider) &&
    hasGitLabAuth(provider)
  );
}
