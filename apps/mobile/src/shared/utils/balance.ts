import type { Booking, Payment } from '@yocabs/api-client';

/** What is still owed on a completed trip: the fare less the token already paid. */
export const balanceDue = (booking: Booking) => booking.totalAmount - booking.tokenAmount;

/**
 * Whether the balance has been settled online. A tourist can always choose to pay the driver
 * directly instead (cash/UPI outside the app), which this has no way to see - so "false" here
 * means "not confirmed paid online", not "definitely still owed".
 */
export const isBalancePaid = (payments: Payment[]) =>
  payments.some(
    (payment) =>
      payment.purpose === 'BALANCE' &&
      (payment.status === 'SUCCEEDED' ||
        payment.status === 'PARTIALLY_REFUNDED' ||
        payment.status === 'REFUNDED'),
  );
