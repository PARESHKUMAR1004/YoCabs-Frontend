import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { brand, colors, spacing } from '@/config/brand';
import { selectDraft, useSearchStore, type PlaceField } from '@/features/tourist/searchStore';
import { MAX_PASSENGERS, MAX_STOPS, validateDraft } from '@/features/tourist/searchDraft';
import { MapCanvas, tripMarkers } from '@/shared/maps';
import { AppText, Button, Card, ChoiceChips, DateField, Row, Screen, Spacer } from '@/shared/ui';
import { showInfo } from '@/shared/utils/feedback';
import { toIsoDate } from '@/shared/utils/format';
import { TRIP_TYPE_OPTIONS, VEHICLE_CATEGORY_OPTIONS } from '@/shared/utils/labels';

function PlaceRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.placeRow}>
      <AppText variant="small" color="textMuted">
        {label}
      </AppText>
      <AppText variant="subheading" color={value ? 'text' : 'textMuted'}>
        {value ?? 'Tap to choose'}
      </AppText>
    </Pressable>
  );
}

export default function Home() {
  const store = useSearchStore();
  const today = toIsoDate(new Date());

  const pick = (field: PlaceField) =>
    router.push({ pathname: '/(tourist)/location-picker', params: { field } });

  function search() {
    const problem = validateDraft(selectDraft(store), today);
    if (problem) {
      showInfo('Check your trip', problem);
      return;
    }
    router.push('/(tourist)/results');
  }

  const pins = tripMarkers(store.pickup, store.destination, store.stops);

  return (
    <Screen footer={<Button title="Search cabs" onPress={search} testID="search" />}>
      <AppText variant="title" color="primary">
        {brand.name}
      </AppText>
      <AppText color="textMuted">Where would you like to go?</AppText>
      <Spacer />

      <Card>
        <PlaceRow label="From" value={store.pickup?.name} onPress={() => pick('pickup')} />
        <Row style={styles.swapRow}>
          <View style={styles.line} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Swap pickup and destination"
            onPress={store.swapPlaces}
          >
            <Ionicons name="swap-vertical" size={22} color={colors.primary} />
          </Pressable>
        </Row>
        {store.stops.map((stop, index) => (
          <Row key={stop.id} style={styles.stopRow}>
            <AppText style={styles.flex}>
              Stop {index + 1}: {stop.name}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove stop ${index + 1}`}
              onPress={() => store.removeStop(index)}
            >
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          </Row>
        ))}
        <PlaceRow label="To" value={store.destination?.name} onPress={() => pick('destination')} />
        {store.stops.length < MAX_STOPS ? (
          <Button title="+ Add a stop" variant="ghost" onPress={() => pick('stop')} />
        ) : null}
      </Card>

      {pins.length ? (
        <MapCanvas markers={pins} connect interactive={false} height={180} testID="trip-map" />
      ) : null}
      <Spacer size="sm" />

      <DateField
        label="Travel date"
        value={store.startDate}
        minimumDate={today}
        onChange={(date) => store.setDates(date)}
      />
      <DateField
        label="Return date (same as travel date for a single day)"
        value={store.endDate}
        minimumDate={store.startDate}
        onChange={(date) => store.setDates(store.startDate, date)}
      />

      <Card>
        <Row style={styles.between}>
          <View>
            <AppText variant="subheading">Passengers</AppText>
            <AppText variant="small" color="textMuted">
              Including children
            </AppText>
          </View>
          <Row>
            <Button
              title="-"
              variant="secondary"
              disabled={store.passengerCount <= 1}
              onPress={() => store.setPassengers(store.passengerCount - 1)}
              style={styles.stepper}
            />
            <AppText variant="heading" style={styles.count}>
              {store.passengerCount}
            </AppText>
            <Button
              title="+"
              variant="secondary"
              disabled={store.passengerCount >= MAX_PASSENGERS}
              onPress={() => store.setPassengers(store.passengerCount + 1)}
              style={styles.stepper}
            />
          </Row>
        </Row>
      </Card>

      <AppText variant="subheading">Vehicle type</AppText>
      <ChoiceChips
        options={VEHICLE_CATEGORY_OPTIONS}
        value={store.vehicleCategory}
        onChange={store.setVehicleCategory}
        allowClear
      />
      <Spacer size="sm" />
      <AppText variant="subheading">Trip type</AppText>
      <ChoiceChips
        options={TRIP_TYPE_OPTIONS}
        value={store.tripType}
        onChange={store.setTripType}
        allowClear
      />
      <AppText variant="small" color="textMuted">
        Leave both unselected to compare every option.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  placeRow: { paddingVertical: spacing.sm },
  swapRow: { justifyContent: 'flex-end' },
  line: { flex: 1, height: 1, backgroundColor: colors.border, marginRight: spacing.md },
  stopRow: { paddingVertical: spacing.xs },
  between: { justifyContent: 'space-between' },
  stepper: { minHeight: 40, minWidth: 44, paddingHorizontal: 0 },
  count: { minWidth: 36, textAlign: 'center' },
});
