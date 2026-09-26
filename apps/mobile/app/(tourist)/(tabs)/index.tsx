import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, shadow, spacing } from '@/config/brand';
import { useFavouritePlaces } from '@/features/tourist/favouritePlaces';
import { PlaceSuggestionRow } from '@/features/tourist/PlaceSuggestionRow';
import { selectDraft, useSearchStore, type PlaceField } from '@/features/tourist/searchStore';
import { validateDraft } from '@/features/tourist/searchDraft';
import { ExploreSection } from '@/features/explore/ExploreSection';
import { useCurrentPickup } from '@/features/tourist/useCurrentPickup';
import { MapCanvas, tripMarkers } from '@/shared/maps';
import { placeProvider, type Place } from '@/shared/places';
import { AppText, Button, ChoiceChips, DateField, Screen, Spacer } from '@/shared/ui';
import { showInfo } from '@/shared/utils/feedback';
import { toIsoDate } from '@/shared/utils/format';
import { TRIP_TYPE_OPTIONS, VEHICLE_CATEGORY_OPTIONS } from '@/shared/utils/labels';

const POPULAR_SHOWN = 5;

function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  return hour < 17 ? 'Good afternoon' : 'Good evening';
}

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
      <View style={styles.hero}>
        <AppText variant="caption" color="primary" style={styles.greeting}>
          {greeting(new Date())}
        </AppText>
        <AppText variant="title" color="textOnPrimary" style={styles.heroTitle}>
          Where to next?
        </AppText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change pickup location"
          onPress={() => pick('pickup')}
          style={styles.location}
        >
          <View style={styles.locationIcon}>
            <Ionicons name="locate" size={18} color={colors.ink} />
          </View>
          <View style={styles.flex}>
            <AppText variant="caption" color="primary">
              Your location
            </AppText>
            <AppText variant="subheading" color="textOnPrimary" numberOfLines={1}>
              {store.pickup?.name ?? (locating ? 'Finding your location…' : 'Set your pickup')}
            </AppText>
          </View>
          <Ionicons name="chevron-down" size={20} color={colors.primary} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Where do you want to go?"
          onPress={() => pick('destination')}
          style={styles.search}
          testID="where-to"
        >
          <Ionicons name="search" size={20} color={colors.primaryDark} />
          <AppText
            variant="subheading"
            color={store.destination ? 'text' : 'textMuted'}
            style={styles.flex}
            numberOfLines={1}
          >
            {store.destination?.name ?? 'Where do you want to go?'}
          </AppText>
        </Pressable>
      </View>

      {store.stops.length ? (
        <AppText variant="small" color="textMuted" style={styles.via}>
          Via {store.stops.map((stop) => stop.name).join(', ')}
        </AppText>
      ) : null}

      {store.only ? (
        <View style={styles.only}>
          <View style={styles.flex}>
            <AppText variant="caption" color="primary">
              Booking with
            </AppText>
            <AppText variant="subheading" color="textOnPrimary" numberOfLines={1}>
              {store.only.vehicleLabel ? `${store.only.vehicleLabel} · ` : ''}
              {store.only.partnerName}
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Stop booking with this partner"
            hitSlop={8}
            onPress={() => store.setOnly(null)}
          >
            <Ionicons name="close-circle" size={24} color={colors.primary} />
          </Pressable>
        </View>
      ) : !store.destination ? (
        <ExploreSection pickup={store.pickup} />
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
  hero: {
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadow.raised,
  },
  greeting: { letterSpacing: 1.5, textTransform: 'uppercase' },
  heroTitle: { marginTop: spacing.xs, marginBottom: spacing.lg },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },
  only: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  via: { marginTop: spacing.sm },
  suggestions: { marginTop: spacing.lg },
  heading: { marginBottom: spacing.xs },
});
