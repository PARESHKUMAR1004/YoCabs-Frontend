import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { TextInput } from 'react-native';
import { colors, radius, spacing } from '@/config/brand';
import { getCurrentPlace } from '@/features/tourist/currentLocation';
import { useSearchStore, type PlaceField } from '@/features/tourist/searchStore';
import { usePlaceSearch } from '@/features/tourist/usePlaceSearch';
import { MapPicker, type Coordinate } from '@/shared/maps';
import { usePlaceAtCoordinate, type Place } from '@/shared/places';
import { AppText, Button, Card, EmptyState, Row, Screen, TextField } from '@/shared/ui';
import { showError } from '@/shared/utils/feedback';

const FIELD_LABEL: Record<PlaceField, string> = {
  pickup: 'Pickup',
  destination: 'Drop',
  stop: 'Stop',
};

/** The coloured dot beside each input, matching the pin colours on the map. */
function FieldDot({ field }: { field: PlaceField }) {
  const tint =
    field === 'destination' ? colors.danger : field === 'stop' ? colors.info : colors.primary;
  return <View style={[styles.dot, { backgroundColor: tint }]} />;
}

export default function LocationPicker() {
  const { field: initialField = 'pickup' } = useLocalSearchParams<{ field: PlaceField }>();
  const setPlace = useSearchStore((state) => state.setPlace);
  const pickup = useSearchStore((state) => state.pickup);
  const destination = useSearchStore((state) => state.destination);

  const chosen: Record<PlaceField, Place | null> = { pickup, destination, stop: null };
  const fields: PlaceField[] = initialField === 'stop' ? ['stop'] : ['pickup', 'destination'];

  const [active, setActive] = useState<PlaceField>(initialField);
  const [text, setText] = useState<Record<PlaceField, string>>({
    pickup: pickup?.name ?? '',
    destination: destination?.name ?? '',
    stop: '',
  });
  const [onMap, setOnMap] = useState(false);
  const [locating, setLocating] = useState(false);

  // Only search once the person edits: a field showing its chosen place should not re-suggest it.
  const typed = text[active];
  const edited = typed !== (chosen[active]?.name ?? '');
  const { term, results, isSearching, popular } = usePlaceSearch(edited ? typed : '');

  const inputs = useRef<Partial<Record<PlaceField, TextInput | null>>>({});
  const [centre, setCentre] = useState<Coordinate | null>(chosen[active] ?? pickup);
  const { place: pinned, isLoading: naming } = usePlaceAtCoordinate(centre, FIELD_LABEL[active]);

  function choose(place: Place) {
    setPlace(active, place);
    setText((current) => ({ ...current, [active]: place.name }));
    setOnMap(false);

    // Filling the pickup moves you straight on to the drop, as the ride apps do.
    if (active === 'pickup' && !destination) {
      setActive('destination');
      inputs.current.destination?.focus();
      return;
    }
    router.back();
  }

  async function fillFromCurrentLocation() {
    setLocating(true);
    try {
      choose(await getCurrentPlace());
    } catch (error) {
      showError(error, 'Could not get your location');
    } finally {
      setLocating(false);
    }
  }

  const suggestions: Place[] = term ? results : popular;

  return (
    <Screen scroll={false}>
      <Card>
        {fields.map((field, index) => (
          <View key={field}>
            {index > 0 ? <View style={styles.connector} /> : null}
            <Row>
              <FieldDot field={field} />
              <View style={styles.flex}>
                <TextField
                  ref={(input) => {
                    inputs.current[field] = input;
                  }}
                  label={FIELD_LABEL[field]}
                  value={text[field]}
                  onChangeText={(value) => setText((current) => ({ ...current, [field]: value }))}
                  onFocus={() => {
                    setActive(field);
                    setOnMap(false);
                  }}
                  placeholder={
                    field === 'destination'
                      ? 'Where are you going?'
                      : 'Where should we pick you up?'
                  }
                  autoFocus={field === initialField}
                  testID={`place-search-${field}`}
                />
              </View>
            </Row>
          </View>
        ))}
      </Card>

      {onMap ? (
        <>
          <MapPicker
            value={centre}
            onChange={setCentre}
            focus={chosen[active]}
            height={300}
            hint={`Drag or tap the map to set the ${FIELD_LABEL[active].toLowerCase()} point.`}
          />
          <Row style={styles.mapRow}>
            <AppText variant="subheading" style={styles.flex}>
              {pinned?.name ?? 'Move the map to choose a point'}
            </AppText>
          </Row>
          <Button
            title={`Set ${FIELD_LABEL[active].toLowerCase()}`}
            disabled={!pinned}
            loading={naming && !pinned}
            onPress={() => pinned && choose(pinned)}
            testID="confirm-map-point"
          />
          <Button title="Back to search" variant="ghost" onPress={() => setOnMap(false)} />
        </>
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={(place) => place.id}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View>
              {active !== 'destination' ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void fillFromCurrentLocation()}
                  style={styles.action}
                >
                  <Ionicons name="locate" size={20} color={colors.primary} />
                  <AppText style={styles.actionText}>
                    {locating ? 'Finding you…' : 'Use my current location'}
                  </AppText>
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setCentre(chosen[active] ?? pickup);
                  setOnMap(true);
                }}
                style={styles.action}
              >
                <Ionicons name="map-outline" size={20} color={colors.primary} />
                <AppText style={styles.actionText}>
                  Set {FIELD_LABEL[active].toLowerCase()} on the map
                </AppText>
              </Pressable>

              <Row style={styles.listHeading}>
                <AppText variant="caption" color="textMuted" style={styles.flex}>
                  {term ? 'Search results' : 'Popular places'}
                </AppText>
                {isSearching ? <ActivityIndicator size="small" /> : null}
              </Row>
            </View>
          }
          ListEmptyComponent={
            term && !isSearching ? (
              <EmptyState
                title="No places found"
                message="Try a different spelling, or set the point on the map."
              />
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => choose(item)}
              style={styles.suggestion}
            >
              <Ionicons name="location-outline" size={20} color={colors.textMuted} />
              <View style={styles.flex}>
                <AppText variant="subheading">{item.name}</AppText>
                {item.subtitle ? (
                  <AppText variant="small" color="textMuted">
                    {item.subtitle}
                  </AppText>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  dot: { width: 10, height: 10, borderRadius: radius.pill, marginRight: spacing.md },
  connector: {
    width: 1,
    height: spacing.md,
    backgroundColor: colors.border,
    marginLeft: 4,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  actionText: { color: colors.primaryDark, fontWeight: '600' },
  listHeading: { marginTop: spacing.sm, marginBottom: spacing.xs },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mapRow: { marginTop: spacing.md, marginBottom: spacing.sm },
});
