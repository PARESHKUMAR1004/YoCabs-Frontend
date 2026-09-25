import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { paymentLauncher } from '@/features/payment/launcher';
import { useBookingFlow } from '@/features/tourist/bookingFlow';
import { useBooking, useInitiatePayment } from '@/features/tourist/hooks';
import { formatCountdown, useSecondsUntil } from '@/features/tourist/useHoldCountdown';
import { AppText, Button, Card, EmptyState, KeyValue, QueryBoundary, Screen } from '@/shared/ui';
import { showError } from '@/shared/utils/feedback';
import { formatMoney } from '@/shared/utils/format';

export default function Payment() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const query = useBooking(bookingId);
  const secondsLeft = useSecondsUntil(query.data?.holdExpiresAt);
  const initiate = useInitiatePayment();
  const resetFlow = useBookingFlow((state) => state.reset);

  // The API confirms the booking when the payment is verified; leave as soon as it says so.
  useEffect(() => {
    if (query.data?.status === 'CONFIRMED') {
      resetFlow();
      router.replace({ pathname: '/(tourist)/booking/[id]', params: { id: bookingId } });
    }
  }, [query.data?.status, bookingId, resetFlow]);

  const pay = useMutation({
    mutationFn: async () => {
      const payment = await initiate.mutateAsync(bookingId);
      await paymentLauncher.pay(payment);
    },
    onSuccess: () => query.refetch(),
    onError: (error) => showError(error, 'Payment did not complete'),
  });

  return (
    <QueryBoundary query={query}>
      {(booking) => {
        if (booking.status === 'CONFIRMED') return <EmptyState title="Booking confirmed" />;

        if (booking.status !== 'PENDING_PAYMENT') {
          return (
            <EmptyState
              title="This booking can no longer be paid"
              message="The hold on this vehicle expired or the booking was cancelled. Please search again."
              action={
                <Button title="Search again" onPress={() => router.replace('/(tourist)/(tabs)')} />
              }
            />
          );
        }

        const expired = secondsLeft === 0;

        return (
          <Screen
            footer={
              <Button
                title={`Pay ${formatMoney(booking.tokenAmount, booking.currency)} to confirm`}
                loading={pay.isPending}
                disabled={expired || !paymentLauncher.available}
                onPress={() => pay.mutate()}
                testID="pay"
              />
            }
          >
            <AppText variant="title">Confirm your booking</AppText>
            <AppText color="textMuted">
              {booking.vehicle?.make} {booking.vehicle?.model} with {booking.partnerName}
            </AppText>

            <Card>
              <KeyValue
                label="Trip total"
                value={formatMoney(booking.totalAmount, booking.currency)}
              />
              <KeyValue
                label="Token to pay now"
                value={formatMoney(booking.tokenAmount, booking.currency)}
                emphasise
              />
              <KeyValue
                label="Balance, paid on the day"
                value={formatMoney(booking.totalAmount - booking.tokenAmount, booking.currency)}
              />
            </Card>

            <Card>
              <AppText variant="subheading" color={expired ? 'danger' : 'warning'}>
                {expired
                  ? 'Your hold has expired'
                  : `Vehicle held for you: ${formatCountdown(secondsLeft)}`}
              </AppText>
              <AppText variant="small" color="textMuted">
                Pay before the timer ends or the vehicle is released to other travellers.
              </AppText>
            </Card>

            {!paymentLauncher.available ? (
              <AppText color="warning">
                Online payment is not enabled in this version of the app yet.
              </AppText>
            ) : null}
          </Screen>
        );
      }}
    </QueryBoundary>
  );
}
