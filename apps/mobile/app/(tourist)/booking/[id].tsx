import { Linking, Share } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { Booking } from '@yocabs/api-client';
import {
  useBooking,
  useBookingPayments,
  useCancelBooking,
  useInvoiceLink,
} from '@/features/tourist/hooks';
import { BalanceCard } from '@/features/tourist/BalanceCard';
import { FareTotal } from '@/features/tourist/FareTotal';
import { isFollowable } from '@/features/tourist/followable';
import { LiveTripMap } from '@/features/tourist/LiveTripMap';
import { tripShareMessage } from '@/features/tourist/shareTrip';
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
import {
  formatDateRange,
  formatDateTime,
  formatMoney,
  humanize,
  toIsoDate,
} from '@/shared/utils/format';
import { bookingStatusLabel, bookingStatusTone, tripTypeLabel } from '@/shared/utils/labels';

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useBooking(id);
  const payments = useBookingPayments(id);
  const cancel = useCancelBooking(id);
  // Two separate mutations, so sharing the trip and viewing the bill each show their own spinner.
  const shareLink = useInvoiceLink(id);
  const viewLink = useInvoiceLink(id);

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

  // WhatsApp, SMS, email, anything else the phone offers: the OS share sheet handles all of them.
  const onShareTrip = async (booking: Booking) => {
    let billUrl: string | undefined;

    if (booking.status === 'COMPLETED') {
      try {
        billUrl = (await shareLink.mutateAsync()).url;
      } catch {
        // Sharing the trip is still worth doing even if the bill link could not be fetched.
      }
    }

    try {
      await Share.share({ message: tripShareMessage(booking, billUrl) });
    } catch (error) {
      showError(error, 'Could not share this trip');
    }
  };

  const onViewBill = () =>
    viewLink.mutate(undefined, {
      onSuccess: (link) => void Linking.openURL(link.url),
      onError: (error) => showError(error, 'Could not open the bill'),
    });

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
          <Button
            title="Share trip details"
            variant="ghost"
            loading={shareLink.isPending}
            onPress={() => void onShareTrip(booking)}
          />
          <Spacer />

          {booking.status === 'PENDING_PAYMENT' ? (
            <Button
              title="Pay token to confirm"
              onPress={() =>
                router.push({ pathname: '/(tourist)/payment', params: { bookingId: booking.id } })
              }
            />
          ) : null}

          {isFollowable(booking, toIsoDate(new Date())) ? (
            <>
              <SectionHeader
                title={
                  booking.status === 'IN_PROGRESS' ? 'Your trip, live' : 'Your driver is on the way'
                }
              />
              <LiveTripMap bookingId={booking.id} booking={booking} />
            </>
          ) : null}

          {booking.status === 'COMPLETED' ? (
            <>
              <BalanceCard booking={booking} payments={payments.data ?? []} />
              <Button
                title="View bill"
                variant="secondary"
                loading={viewLink.isPending}
                onPress={onViewBill}
                testID="view-bill"
              />
              <Spacer size="sm" />
            </>
          ) : null}

          {booking.tripCode && (booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') ? (
            <>
              <TripCodeCard code={booking.tripCode} />
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

          {booking.driver && (booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') ? (
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
          <FareTotal total={booking.totalAmount} currency={booking.currency} />
          <Card>
            <KeyValue
              label="Token paid online"
              value={formatMoney(booking.tokenAmount, booking.currency)}
            />
            <KeyValue
              label="Balance due after the trip"
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
                    label={`${payment.purpose === 'BALANCE' ? 'Trip balance' : 'Booking token'} · ${humanize(payment.status)} · ${formatDateTime(payment.createdAt)}`}
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
          {booking.status === 'COMPLETED' && !booking.reviewed ? (
            <Button
              title="Rate this trip"
              onPress={() =>
                router.push({ pathname: '/(tourist)/review/[id]', params: { id: booking.id } })
              }
            />
          ) : booking.status === 'COMPLETED' && booking.reviewed ? (
            <AppText color="textMuted" align="center">
              Thanks, you already rated this trip.
            </AppText>
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
