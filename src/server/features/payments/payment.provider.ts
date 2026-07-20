import type { PaymentProviderName, PaymentStatus } from '@/shared/types';
import { config } from '@/server/config';
import { AppError } from '@/server/lib/errors';

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  currency: string;
}

export interface CreatePaymentResult {
  provider: PaymentProviderName;
  status: PaymentStatus;
  externalId?: string;
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
}

/** Cash on delivery / pay later — no external charge. */
export class CodPaymentProvider implements PaymentProvider {
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    return {
      provider: 'cod',
      status: 'pending',
      externalId: `cod_${input.orderId}`,
    };
  }
}

/**
 * Placeholder for future Stripe integration.
 * Throws until Stripe keys and SDK are wired up.
 */
export class StripePaymentProvider implements PaymentProvider {
  async createPayment(_input: CreatePaymentInput): Promise<CreatePaymentResult> {
    throw new AppError(
      'Stripe payments are not configured yet. Set PAYMENT_PROVIDER=cod or implement Stripe.',
      501
    );
  }
}

export function getPaymentProvider(): PaymentProvider {
  const name = config.paymentProvider;
  if (name === 'stripe') {
    return new StripePaymentProvider();
  }
  return new CodPaymentProvider();
}
