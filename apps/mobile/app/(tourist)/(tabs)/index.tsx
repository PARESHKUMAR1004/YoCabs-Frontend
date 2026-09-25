import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/config/brand';
import { useFavouritePlaces } from '@/features/tourist/favouritePlaces';
import { PlaceSuggestionRow } from '@/features/tourist/PlaceSuggestionRow';
import { selectDraft, useSearchStore, type PlaceField } from '@/features/tourist/searchStore';
import { validateDraft } from '@/features/tourist/searchDraft';
import { useCurrentPickup } from '@/features/tourist/useCurrentPickup';
import { MapCanvas, tripMarkers } from '@/shared/maps';
import { placeProvider, type Place } from '@/shared/places';
import { AppText, Button, ChoiceChips, DateField, Screen, Spacer } from '@/shared/ui';
import { showInfo } from '@/shared/utils/feedback';
import { toIsoDate } from '@/shared/utils/format';
import { TRIP_TYPE_OPTIONS, VEHICLE_CATEGORY_OPTIONS } from '@/shared/utils/labels';

const POPULAR_SHOWN = 5;

export default function Home() {
  const store = useSearchStore();
  const favourites = useFavouritePlaces((state) => state.places);
  const hydrateFavourites = useFavouritePlaces((state) => state.hydrate);
  const today = toIsoDate(new Date());
  const locating = useCurrentPickup();

  // Travel dates are only asked for when the trip is not today.
  const [otherDate, setOtherDate] = useState(store.startDate !== today || store.endDate !== today);

  useEffect(() => {
    void hydrateFavourites();
  }, [hydrateFavourites]);

  const pick = (field: PlaceField) =>
    router.push({ pathname: '/(tourist)/location-picker', params: { field } });

  function bookForToday() {
    store.setDates(today, today);
    setOtherDate(false);
  }

  function search() {
    // A search left open past midnight would otherwise fail on a stale "today".
    const draft = selectDraft(store);
    if (!otherDate && draft.startDate !== today) {
      store.setDates(today, today);
      draft.startDate = today;
      draft.endDate = today;
    }

    const problem = validateDraft(draft, today);
    if (problem) {
      showInfo('Check your trip', problem);
      return;
    }
    router.push('/(tourist)/results');
  }

  const pins = tripMarkers(store.pickup, store.destination, store.stops);
  const quickPicks: Place[] = [
    ...favourites,
    ...placeProvider
      .popular()
      .filter((place) => !favourites.some((saved) => saved.id === place.id))
      .slice(0, POPULAR_SHOWN),
  ];

  return (
    <Screen
      footer={
        store.destination ? (
          <Button title="Search cabs" onPress={search} testID="search" />
        ) : undefined
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change pickup location"
        onPress={() => pick('pickup')}
        style={styles.location}
      >
        <View style={styles.locationIcon}>
          <Ionicons name="locate" size={18} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText variant="caption" color="textMuted">
            Your location
          </AppText>
          <AppText variant="subheading" numberOfLines={1}>
            {store.pickup?.name ?? (locating ? 'Finding your location…' : 'Set your pickup')}
          </AppText>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Where do you want to go?"
        onPress={() => pick('destination')}
        style={styles.search}
        testID="where-to"
      >
        <Ionicons name="search" size={20} color={colors.primary} />
        <AppText
          variant="subheading"
          color={store.destination ? 'text' : 'textMuted'}
          style={styles.flex}
          numberOfLines={1}
        >
          {store.destination?.name ?? 'Where do you want to go?'}
        </AppText>
      </Pressable>

      {store.stops.length ? (
        <AppText variant="small" color="textMuted" style={styles.via}>
          Via {store.stops.map((stop) => stop.name).join(', ')}
        </AppText>
      ) : null}

      {!store.destination ? (
        <View style={styles.suggestions}>
          <AppText variant="caption" color="textMuted" style={styles.heading}>
            {favourites.length ? 'Your favourites and popular places' : 'Popular places'}
          </AppText>
          {quickPicks.map((place) => (
            <PlaceSuggestionRow
              key={place.id}
              place={place}
              onChoose={(chosen) => store.setPlace('destination', chosen)}
            />
          ))}
        </View>
      ) : (
        <>
          {pins.length ? (
            <MapCanvas markers={pins} connect interactive={false} height={180} testID="trip-map" />
          ) : null}
          <Spacer size="sm" />

          {otherDate ? (
            <>
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
              <Button title="Book for today instead" variant="ghost" onPress={bookForToday} />
            </>
          ) : (
            <Button
              title="Book for another date"
              variant="secondary"
              onPress={() => setOtherDate(true)}
              testID="another-date"
            />
          )}

          <Spacer size="sm" />
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
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  locationIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  via: { marginTop: spacing.sm },
  suggestions: { marginTop: spacing.lg },
  heading: { marginBottom: spacing.xs },
});
