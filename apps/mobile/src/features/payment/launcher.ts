import type { Payment } from '@yocabs/api-client';
import { env } from '@/config/env';
import { api } from '@/shared/api/client';

/**
 * How money actually moves. A real gateway (Razorpay, PhonePe...) is one more implementation of
 * this interface: open the provider's checkout for `payment.gatewayOrderId`, resolve when done.
 */
export interface PaymentLauncher {
  /** False when this build cannot take payments (the screen then explains it). */
  readonly available: boolean;
  pay(payment: Payment): Promise<void>;
}

/** Development: the API's sandbox gateway confirms the payment. */
export const sandboxLauncher: PaymentLauncher = {
  available: true,
  async pay(payment) {
    await api.tourist.payments.simulateSandbox(payment.id, 'SUCCESS');
  },
};

export const unavailableLauncher: PaymentLauncher = {
  available: false,
  async pay() {
    throw new Error('Online payment is not enabled in this version of the app yet.');
  },
};

export const paymentLauncher: PaymentLauncher = env.sandboxPayments
  ? sandboxLauncher
  : unavailableLauncher;
