import type { Result } from '@mono-magic/utils-ts-core';
import type { DataAccessError } from '../common/query.interface.js';

/**
 * Monetary amount represented in minor currency units (e.g., cents).
 */
export interface Money {
  /** Integer amount in minor currency units. */
  readonly amountMinor: number;
  /** ISO-4217 three-letter currency code (e.g., `'USD'`). */
  readonly currency: string;
}

/**
 * Lifecycle status of a {@link PaymentIntent}.
 */
export type PaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'processing'
  | 'succeeded'
  | 'canceled'
  | 'refunded';

/**
 * Payment intent record.
 */
export interface PaymentIntent {
  /** Provider-assigned payment intent identifier. */
  readonly id: string;
  /** Monetary amount. */
  readonly amount: Money;
  /** Current payment status. */
  readonly status: PaymentStatus;
  /** Optional client secret for frontend confirmation flows. */
  readonly clientSecret?: string;
  /** Optional metadata attached to the intent. */
  readonly metadata?: Readonly<Record<string, string>>;
}

/**
 * Input for creating a new {@link PaymentIntent}.
 */
export interface CreatePaymentIntentInput {
  readonly amount: Money;
  readonly customerId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

/**
 * Contract for payment processing providers.
 */
export interface IPaymentProvider {
  /** Creates a new payment intent. */
  createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<Result<PaymentIntent, DataAccessError>>;
  /** Confirms a payment intent by identifier. */
  confirmPaymentIntent(
    intentId: string,
    paymentMethodId?: string,
  ): Promise<Result<PaymentIntent, DataAccessError>>;
  /** Retrieves a payment intent by identifier. */
  getPaymentIntent(intentId: string): Promise<Result<PaymentIntent, DataAccessError>>;
  /** Refunds a succeeded payment intent (full or partial minor amount). */
  refundPayment(
    intentId: string,
    amountMinor?: number,
  ): Promise<Result<PaymentIntent, DataAccessError>>;
}

/**
 * Abstract base class for {@link IPaymentProvider} implementations.
 */
export abstract class BasePaymentProvider implements IPaymentProvider {
  public abstract createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<Result<PaymentIntent, DataAccessError>>;
  public abstract confirmPaymentIntent(
    intentId: string,
    paymentMethodId?: string,
  ): Promise<Result<PaymentIntent, DataAccessError>>;
  public abstract getPaymentIntent(
    intentId: string,
  ): Promise<Result<PaymentIntent, DataAccessError>>;
  public abstract refundPayment(
    intentId: string,
    amountMinor?: number,
  ): Promise<Result<PaymentIntent, DataAccessError>>;
}
