import type { ExploreVehicle } from '@yocabs/api-client';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/config/brand';
import { useExplorePartner } from '@/features/explore/hooks';
import { useSearchStore } from '@/features/tourist/searchStore';
import { api } from '@/shared/api/client';
import {
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  QueryBoundary,
  RatingBadge,
  Row,
  Screen,
} from '@/shared/ui';
import { categoryLabel } from '@/shared/utils/labels';

function VehicleCard({ vehicle, onBook }: { vehicle: ExploreVehicle; onBook: () => void }) {
  const photo = vehicle.photos[0];

  return (
    <Card>
      {photo ? (
        <Image source={{ uri: api.assetUrl(photo) }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={[styles.photo, styles.noPhoto]}>
          <Ionicons name="car-sport" size={34} color={colors.primary} />
        </View>
      )}
      <AppText variant="small" color="primaryDark" style={styles.eyebrow}>
        {categoryLabel(vehicle.category)} · {vehicle.passengerCapacity} seats
      </AppText>
      <AppText variant="heading">
        {vehicle.make} {vehicle.model}
      </AppText>
      {vehicle.facilities.length > 0 ? (
        <Row style={styles.facilities}>
          {vehicle.facilities.slice(0, 3).map((facility) => (
            <Badge key={facility.code} label={facility.name} />
          ))}
          {vehicle.facilities.length > 3 ? (
            <Badge label={`+${vehicle.facilities.length - 3}`} />
          ) : null}
        </Row>
      ) : null}
      <Button title="Book this cab" onPress={onBook} style={styles.book} testID="book-this-cab" />
    </Card>
  );
}

export default function PartnerPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pickup = useSearchStore((state) => state.pickup);
  const destination = useSearchStore((state) => state.destination);
  const setOnly = useSearchStore((state) => state.setOnly);
  const query = useExplorePartner(id, pickup);

  if (!pickup) {
    return (
      <EmptyState
        title="Set your location first"
        message="We show a travel partner's cabs for the place you are travelling from."
        action={<Button title="Back" onPress={() => router.back()} />}
      />
    );
  }

  return (
    <QueryBoundary query={query}>
      {({ partner, vehicles }) => (
        <Screen>
          <AppText variant="caption" color="primaryDark" style={styles.kicker}>
            Travel partner
          </AppText>
          <AppText variant="title">{partner.name}</AppText>
          <Row style={styles.summary}>
            <RatingBadge rating={partner.rating} count={partner.reviewCount} />
            <AppText color="textMuted">
              {' '}
              · {vehicles.length} {vehicles.length === 1 ? 'cab' : 'cabs'} near {pickup.name}
            </AppText>
          </Row>

          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onBook={() => {
                setOnly({
                  partnerId: partner.id,
                  partnerName: partner.name,
                  vehicleId: vehicle.id,
                  vehicleLabel: `${vehicle.make} ${vehicle.model}`,
                });
                // With a destination already chosen, go straight to the price; otherwise ask for it.
                if (destination) router.push('/(tourist)/results');
                else router.navigate('/(tourist)/(tabs)');
              }}
            />
          ))}

          <Button
            title={`See all of ${partner.name}'s prices for a trip`}
            variant="ghost"
            onPress={() => {
              setOnly({ partnerId: partner.id, partnerName: partner.name });
              if (destination) router.push('/(tourist)/results');
              else router.navigate('/(tourist)/(tabs)');
            }}
          />
        </Screen>
      )}
    </QueryBoundary>
  );
}

const styles = StyleSheet.create({
  kicker: { textTransform: 'uppercase', letterSpacing: 2, marginBottom: spacing.xs },
  summary: { marginTop: spacing.xs, marginBottom: spacing.lg },
  photo: {
    height: 170,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  noPhoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink },
  eyebrow: { textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs },
  facilities: { flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  book: { marginTop: spacing.md },
});
