import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { brand, spacing } from '@/config/brand';
import { useBookingFlow } from '@/features/tourist/bookingFlow';
import { useCreateBooking } from '@/features/tourist/hooks';
import { FareTotal } from '@/features/tourist/FareTotal';
import { AppText, Button, Card, EmptyState, KeyValue, Screen, SectionHeader } from '@/shared/ui';
import { showError } from '@/shared/utils/feedback';
import { formatDateRange, formatMoney } from '@/shared/utils/format';
import { categoryLabel, tripTypeLabel } from '@/shared/utils/labels';

export default function Checkout() {
  const option = useBookingFlow((state) => state.option);
  const draft = useBookingFlow((state) => state.draft);
  const negotiation = useBookingFlow((state) => state.negotiation);
  const createBooking = useCreateBooking();

  if (!option || !draft) {
    return (
      <EmptyState
        title="Nothing to book yet"
        action={<Button title="Search cabs" onPress={() => router.replace('/(tourist)/(tabs)')} />}
      />
    );
  }

  const agreed = negotiation?.agreedAmount ?? null;
  const total = agreed ?? option.price.totalAmount;
  const currency = option.price.currency;

  return (
    <Screen
      footer={
        <Button
          title={`Confirm booking · ${formatMoney(total, currency)}`}
          loading={createBooking.isPending}
          onPress={() =>
            createBooking.mutate(undefined, {
              onSuccess: (booking) =>
                router.replace({
                  pathname: '/(tourist)/payment',
                  params: { bookingId: booking.id },
                }),
              onError: (error) => showError(error, 'Could not create your booking'),
            })
          }
          testID="confirm-booking"
        />
      }
    >
      <SectionHeader title="Your trip" />
      <Card>
        <KeyValue label="From" value={draft.pickup?.name ?? '-'} />
        {draft.stops.map((stop, index) => (
          <KeyValue key={stop.id} label={`Stop ${index + 1}`} value={stop.name} />
        ))}
        <KeyValue label="To" value={draft.destination?.name ?? '-'} />
        <KeyValue label="Date" value={formatDateRange(draft.startDate, draft.endDate)} />
      </Card>

      <SectionHeader title="Your cab" />
      <Card>
        <AppText variant="subheading">{option.travelPartnerName}</AppText>
        <AppText color="textMuted">
          {option.make} {option.model} · {categoryLabel(option.category)} ·{' '}
          {tripTypeLabel(option.tripType)}
        </AppText>
      </Card>

      <SectionHeader title="Fare" />
      <Card>
        <FareTotal total={option.price.totalAmount} currency={currency} label="Listed fare" />
        {agreed !== null ? (
          <>
            <KeyValue label="Negotiated price" value={formatMoney(agreed, currency)} emphasise />
            <AppText variant="small" color="success">
              You save {formatMoney(option.price.totalAmount - agreed, currency)}.
            </AppText>
          </>
        ) : null}
      </Card>

      <AppText variant="small" color="textMuted" style={styles.note}>
        Next you pay a {brand.tokenPercentDescription} booking token to confirm. The rest is paid to
        the travel partner on the day of travel. Free cancellation applies up to 24 hours before the
        trip.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { marginTop: spacing.sm },
});
