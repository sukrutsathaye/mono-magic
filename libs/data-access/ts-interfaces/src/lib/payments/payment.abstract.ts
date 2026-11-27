import type { Result } from '@mono-magic/utils-ts-core';
import type { DataAccessError } from '../common/query.interface.js';
import type {
  CreatePaymentIntentInput,
  IPaymentProvider,
  PaymentIntent,
} from './payment.interface.js';

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
