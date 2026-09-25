import type { Booking } from '@yocabs/api-client';
import { StyleSheet } from 'react-native';
import { spacing } from '@/config/brand';
import { formatDateRange, formatMoney } from '@/shared/utils/format';
import { bookingStatusLabel, bookingStatusTone, tripTypeLabel } from '@/shared/utils/labels';
import { Badge } from './Chips';
import { Card, Row } from './Layout';
import { AppText } from './Text';

interface Props {
  booking: Booking;
  onPress: () => void;
  /** Who is on the other side of the trip: the partner for tourists, the tourist for partners and drivers. */
  counterparty?: string | null;
}

/** One booking in a list. Shared by the tourist, partner and driver apps. */
export function BookingCard({ booking, onPress, counterparty }: Props) {
  return (
    <Card onPress={onPress}>
      <Row style={styles.top}>
        <AppText variant="subheading" style={styles.route}>
          {booking.pickup} → {booking.destination}
        </AppText>
        <Badge
          label={bookingStatusLabel(booking.status)}
          tone={bookingStatusTone(booking.status)}
        />
      </Row>
      <AppText color="textMuted">{formatDateRange(booking.startDate, booking.endDate)}</AppText>
      <AppText color="textMuted">
        {tripTypeLabel(booking.tripType)}
        {booking.vehicle ? ` · ${booking.vehicle.make} ${booking.vehicle.model}` : ''}
      </AppText>
      <Row style={styles.bottom}>
        <AppText variant="small" color="textMuted" style={styles.route}>
          {counterparty ?? ''}
        </AppText>
        <AppText variant="subheading">{formatMoney(booking.totalAmount, booking.currency)}</AppText>
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.xs },
  bottom: { justifyContent: 'space-between', marginTop: spacing.sm },
  route: { flex: 1 },
});
