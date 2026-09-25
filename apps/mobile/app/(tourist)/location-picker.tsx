import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { TextInput } from 'react-native';
import { colors, radius, spacing } from '@/config/brand';
import { getCurrentPlace } from '@/features/tourist/currentLocation';
import { useFavouritePlaces } from '@/features/tourist/favouritePlaces';
import { PlaceSuggestionRow } from '@/features/tourist/PlaceSuggestionRow';
import { MAX_STOPS } from '@/features/tourist/searchDraft';
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

const SCREEN_TITLE: Record<PlaceField, string> = {
  pickup: 'Pickup',
  destination: 'Drop',
  stop: 'Add a stop',
};

/** The coloured dot beside each input, matching the pin colours on the map. */
function FieldDot({ field }: { field: PlaceField }) {
  const tint =
    field === 'destination' ? colors.danger : field === 'stop' ? colors.info : colors.primary;
  return <View style={[styles.dot, { backgroundColor: tint }]} />;
}

/** A small rounded button under the inputs ("Select on map", "Add stops"). */
function ActionChip({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.chip}>
      <Ionicons name={icon} size={18} color={colors.text} />
      <AppText variant="caption" style={styles.chipText}>
        {label}
      </AppText>
    </Pressable>
  );
}

export default function LocationPicker() {
  const { field: initialField = 'destination' } = useLocalSearchParams<{ field: PlaceField }>();
  const setPlace = useSearchStore((state) => state.setPlace);
  const removeStop = useSearchStore((state) => state.removeStop);
  const pickup = useSearchStore((state) => state.pickup);
  const destination = useSearchStore((state) => state.destination);
  const stops = useSearchStore((state) => state.stops);
  const favourites = useFavouritePlaces((state) => state.places);

  const chosen: Record<PlaceField, Place | null> = { pickup, destination, stop: null };

  const [active, setActive] = useState<PlaceField>(initialField);
  const [addingStop, setAddingStop] = useState(false);
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

  // A newly added stop input appears empty and should take focus straight away.
  useEffect(() => {
    if (addingStop) inputs.current.stop?.focus();
  }, [addingStop]);

  function choose(place: Place) {
    setPlace(active, place);
    setOnMap(false);

    if (active === 'stop') {
      // Stay on the page: a trip can have several stops, and the drop is still to be confirmed.
      setAddingStop(false);
      setText((current) => ({ ...current, stop: '' }));
      setActive('destination');
      return;
    }

    setText((current) => ({ ...current, [active]: place.name }));

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

  function startAddingStop() {
    setAddingStop(true);
    setActive('stop');
    setOnMap(false);
  }

  function openMap() {
    setCentre(chosen[active] ?? pickup);
    setOnMap(true);
  }

  const showFavourites = !term && favourites.length > 0;
  const suggestions: Place[] = term
    ? results
    : popular.filter((place) => !favourites.some((saved) => saved.id === place.id));

  const renderInput = (field: PlaceField) => (
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
              ? 'Drop location'
              : field === 'stop'
                ? 'Stop location'
                : 'Pickup location'
          }
          autoFocus={field === initialField}
          testID={`place-search-${field}`}
        />
      </View>
    </Row>
  );

  return (
    <Screen scroll={false}>
      <Stack.Screen options={{ title: SCREEN_TITLE[initialField] }} />

      <Card>
        {renderInput('pickup')}

        {stops.map((stop, index) => (
          <Row key={stop.id} style={styles.stopRow}>
            <FieldDot field="stop" />
            <AppText style={styles.flex} numberOfLines={1}>
              {stop.name}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove stop ${index + 1}`}
              hitSlop={8}
              onPress={() => removeStop(index)}
            >
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          </Row>
        ))}
        {addingStop ? renderInput('stop') : null}

        {renderInput('destination')}
      </Card>

      <Row style={styles.chips}>
        <ActionChip icon="map-outline" label="Select on map" onPress={openMap} />
        {stops.length < MAX_STOPS && !addingStop ? (
          <ActionChip icon="add-circle" label="Add stops" onPress={startAddingStop} />
        ) : null}
      </Row>

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
              {active === 'pickup' ? (
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

              {showFavourites ? (
                <View>
                  <AppText variant="caption" color="textMuted" style={styles.listHeading}>
                    Your favourites
                  </AppText>
                  {favourites.map((place) => (
                    <PlaceSuggestionRow key={place.id} place={place} onChoose={choose} />
                  ))}
                </View>
              ) : null}

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
                title="Could not get address"
                message="Try searching for an alternate location, or select it on the map."
              />
            ) : null
          }
          renderItem={({ item }) => <PlaceSuggestionRow place={item} onChoose={choose} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  dot: { width: 10, height: 10, borderRadius: radius.pill, marginRight: spacing.md },
  stopRow: { paddingVertical: spacing.sm, marginBottom: spacing.sm },
  chips: { gap: spacing.sm, marginVertical: spacing.md, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  chipText: { color: colors.text },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  actionText: { color: colors.primaryDark },
  listHeading: { marginTop: spacing.sm, marginBottom: spacing.xs },
  mapRow: { marginTop: spacing.md, marginBottom: spacing.sm },
});
