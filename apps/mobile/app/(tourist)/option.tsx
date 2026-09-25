import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/config/brand';
import { useBookingFlow } from '@/features/tourist/bookingFlow';
import { FareTotal } from '@/features/tourist/FareTotal';
import { api } from '@/shared/api/client';
import {
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  KeyValue,
  RatingBadge,
  Row,
  Screen,
  SectionHeader,
} from '@/shared/ui';
import { humanize } from '@/shared/utils/format';
import { categoryLabel, tripTypeLabel } from '@/shared/utils/labels';

export default function OptionDetails() {
  const option = useBookingFlow((state) => state.option);

  if (!option) {
    return (
      <EmptyState
        title="Choose a vehicle first"
        action={
          <Button title="Back to results" onPress={() => router.replace('/(tourist)/results')} />
        }
      />
    );
  }

  return (
    <Screen
      footer={
        <View style={styles.actions}>
          <Button
            title="Ask for a better price"
            variant="secondary"
            onPress={() => router.push('/(tourist)/negotiate')}
            style={styles.flex}
          />
          <Button
            title="Book now"
            onPress={() => router.push('/(tourist)/checkout')}
            style={styles.flex}
            testID="book-now"
          />
        </View>
      }
    >
      {option.photos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photos}>
          {option.photos.map((path) => (
            <Image
              key={path}
              source={{ uri: api.assetUrl(path) }}
              style={styles.photo}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      ) : null}

      <AppText variant="title">
        {option.make} {option.model}
      </AppText>
      <Row style={styles.meta}>
        <AppText color="textMuted">{option.travelPartnerName}</AppText>
        <RatingBadge rating={option.rating} count={option.reviewCount} />
      </Row>
      <Row style={styles.badges}>
        <Badge label={categoryLabel(option.category)} tone="info" />
        <Badge label={tripTypeLabel(option.tripType)} />
      </Row>

      <Card>
        <KeyValue label="Seats" value={`${option.passengerCapacity}`} />
        {option.luggageCapacity !== null ? (
          <KeyValue label="Luggage" value={`${option.luggageCapacity} bags`} />
        ) : null}
        {option.fuelType ? <KeyValue label="Fuel" value={humanize(option.fuelType)} /> : null}
        {option.transmission ? (
          <KeyValue label="Transmission" value={humanize(option.transmission)} />
        ) : null}
        {option.modelYear ? <KeyValue label="Model year" value={`${option.modelYear}`} /> : null}
      </Card>

      {option.facilities.length > 0 ? (
        <>
          <SectionHeader title="Includes" />
          <Row style={styles.facilities}>
            {option.facilities.map((facility) => (
              <Badge key={facility.code} label={facility.name} tone="success" />
            ))}
          </Row>
        </>
      ) : null}

      <FareTotal total={option.price.totalAmount} currency={option.price.currency} />
      <AppText variant="small" color="textMuted">
        You pay only a small token now to confirm. You will not be charged until you confirm the
        booking.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.md },
  photos: { marginBottom: spacing.md },
  photo: {
    width: 280,
    height: 170,
    borderRadius: radius.lg,
    marginRight: spacing.md,
    backgroundColor: colors.surface,
  },
  meta: { justifyContent: 'space-between', marginBottom: spacing.sm },
  badges: { gap: spacing.sm, marginBottom: spacing.md },
  facilities: { flexWrap: 'wrap', gap: spacing.sm },
});
