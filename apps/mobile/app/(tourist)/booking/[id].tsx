import { router, useLocalSearchParams } from 'expo-router';
import { useBooking, useBookingPayments, useCancelBooking } from '@/features/tourist/hooks';
import { FareTotal } from '@/features/tourist/FareTotal';
import { TripCodeCard } from '@/features/tourist/TripCodeCard';
import {
  AppText,
  Badge,
  Button,
  CallButton,
  Card,
  KeyValue,
  QueryBoundary,
  Row,
  Screen,
  SectionHeader,
  Spacer,
} from '@/shared/ui';
import { confirmAction, showError } from '@/shared/utils/feedback';
import { formatDateRange, formatDateTime, formatMoney, humanize } from '@/shared/utils/format';
import { bookingStatusLabel, bookingStatusTone, tripTypeLabel } from '@/shared/utils/labels';

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useBooking(id);
  const payments = useBookingPayments(id);
  const cancel = useCancelBooking(id);

  const onCancel = async () => {
    const confirmed = await confirmAction(
      'Cancel this trip?',
      'Refunds follow the cancellation policy: the token is returned in full only if you cancel more than 24 hours before the trip.',
      'Cancel trip',
      true,
    );
    if (confirmed)
      cancel.mutate(undefined, { onError: (error) => showError(error, 'Could not cancel') });
  };

  return (
    <QueryBoundary query={query}>
      {(booking) => (
        <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="title" style={{ flex: 1 }}>
              {booking.pickup} → {booking.destination}
            </AppText>
            <Badge
              label={bookingStatusLabel(booking.status)}
              tone={bookingStatusTone(booking.status)}
            />
          </Row>
          <AppText color="textMuted">{formatDateRange(booking.startDate, booking.endDate)}</AppText>
          <Spacer />

          {booking.status === 'PENDING_PAYMENT' ? (
            <Button
              title="Pay token to confirm"
              onPress={() =>
                router.push({ pathname: '/(tourist)/payment', params: { bookingId: booking.id } })
              }
            />
          ) : null}

          {booking.tripCode ? (
            <>
              <TripCodeCard code={booking.tripCode} started={booking.status === 'IN_PROGRESS'} />
              <Spacer size="sm" />
            </>
          ) : null}

          <SectionHeader title="Trip" />
          <Card>
            <KeyValue label="Type" value={tripTypeLabel(booking.tripType)} />
            <KeyValue label="Travel partner" value={booking.partnerName ?? '-'} />
            {booking.vehicle ? (
              <KeyValue
                label="Vehicle"
                value={`${booking.vehicle.make} ${booking.vehicle.model} · ${booking.vehicle.registrationNumber}`}
              />
            ) : null}
          </Card>

          {booking.driver ? (
            <>
              <SectionHeader title="Your driver" />
              <Card>
                <AppText variant="subheading">{booking.driver.name ?? 'Driver'}</AppText>
                <CallButton title="Call driver" mobile={booking.driver.mobile} />
              </Card>
            </>
          ) : booking.status === 'CONFIRMED' ? (
            <AppText color="textMuted">
              The travel partner will assign a driver before your trip. You will be notified.
            </AppText>
          ) : null}

          <SectionHeader title="Fare" />
          <Card>
            <FareTotal total={booking.totalAmount} currency={booking.currency} />
            <KeyValue
              label="Token paid online"
              value={formatMoney(booking.tokenAmount, booking.currency)}
            />
            <KeyValue
              label="Balance to pay the partner"
              value={formatMoney(booking.totalAmount - booking.tokenAmount, booking.currency)}
            />
          </Card>

          {payments.data?.length ? (
            <>
              <SectionHeader title="Payments" />
              <Card>
                {payments.data.map((payment) => (
                  <KeyValue
                    key={payment.id}
                    label={`${humanize(payment.status)} · ${formatDateTime(payment.createdAt)}`}
                    value={
                      payment.refundedAmount > 0
                        ? `${formatMoney(payment.amount, payment.currency)} (refunded ${formatMoney(payment.refundedAmount, payment.currency)})`
                        : formatMoney(payment.amount, payment.currency)
                    }
                  />
                ))}
              </Card>
            </>
          ) : null}

          {booking.cancellationReason ? (
            <AppText color="danger">Cancelled: {booking.cancellationReason}</AppText>
          ) : null}

          <Spacer />
          {booking.status === 'COMPLETED' ? (
            <Button
              title="Rate this trip"
              onPress={() =>
                router.push({ pathname: '/(tourist)/review/[id]', params: { id: booking.id } })
              }
            />
          ) : null}
          {booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT' ? (
            <Button
              title="Cancel trip"
              variant="danger"
              loading={cancel.isPending}
              onPress={() => void onCancel()}
            />
          ) : null}
          <Spacer size="sm" />
          <Button
            title="Get help with this trip"
            variant="ghost"
            onPress={() =>
              router.push({ pathname: '/(tourist)/support/new', params: { bookingId: booking.id } })
            }
          />
        </Screen>
      )}
    </QueryBoundary>
  );
}
