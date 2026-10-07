import type { Booking, Payment } from '@yocabs/api-client';
import { paymentLauncher } from '@/features/payment/launcher';
import { AppText, Button, Card } from '@/shared/ui';
import { balanceDue, isBalancePaid } from '@/shared/utils/balance';
import { showError } from '@/shared/utils/feedback';
import { formatMoney } from '@/shared/utils/format';
import { usePayBalance } from './hooks';

/**
 * Shown once the driver has completed the trip: pay what is left in the app, or settle it with
 * the driver directly. Paying online is a choice, never a requirement.
 */
export function BalanceCard({ booking, payments }: { booking: Booking; payments: Payment[] }) {
  const pay = usePayBalance(booking.id);
  const owed = balanceDue(booking);

  if (owed <= 0) return null;

  if (isBalancePaid(payments)) {
    return (
      <Card>
        <AppText variant="subheading" color="success">
          Paid in full
        </AppText>
        <AppText color="textMuted">
          Thank you. You paid {formatMoney(owed, booking.currency)} in the app.
        </AppText>
      </Card>
    );
  }

  return (
    <Card>
      <AppText variant="heading">Your trip is complete</AppText>
      <AppText color="textMuted">
        {formatMoney(owed, booking.currency)} is left to pay after your{' '}
        {formatMoney(booking.tokenAmount, booking.currency)} booking token.
      </AppText>
      <Button
        title={`Pay ${formatMoney(owed, booking.currency)} now`}
        loading={pay.isPending}
        disabled={!paymentLauncher.available}
        onPress={() =>
          pay.mutate(undefined, {
            onError: (error) => showError(error, 'Payment did not complete'),
          })
        }
        testID="pay-balance"
      />
      <AppText variant="small" color="textMuted">
        {paymentLauncher.available
          ? 'Prefer cash or UPI? You can pay your driver directly instead.'
          : 'Online payment is not enabled yet. Please pay your driver directly.'}
      </AppText>
    </Card>
  );
}
