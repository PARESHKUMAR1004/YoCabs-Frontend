import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/config/brand';
import type { Place } from '@/shared/places';
import { AppText } from '@/shared/ui';
import { isFavourite, useFavouritePlaces } from './favouritePlaces';

/** One suggested place: tap to choose it, tap the star to keep it as a favourite. */
export function PlaceSuggestionRow({
  place,
  onChoose,
}: {
  place: Place;
  onChoose: (place: Place) => void;
}) {
  const favourites = useFavouritePlaces((state) => state.places);
  const toggle = useFavouritePlaces((state) => state.toggle);
  const saved = isFavourite(favourites, place.id);

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        onPress={() => onChoose(place)}
        style={styles.main}
        testID={`place-${place.id}`}
      >
        <Ionicons
          name={saved ? 'heart' : 'location-outline'}
          size={20}
          color={saved ? colors.primary : colors.textMuted}
        />
        <View style={styles.text}>
          <AppText variant="subheading" numberOfLines={1}>
            {place.name}
          </AppText>
          {place.subtitle ? (
            <AppText variant="small" color="textMuted" numberOfLines={1}>
              {place.subtitle}
            </AppText>
          ) : null}
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={saved ? `Remove ${place.name} from favourites` : `Save ${place.name}`}
        hitSlop={8}
        onPress={() => toggle(place)}
      >
        <Ionicons
          name={saved ? 'star' : 'star-outline'}
          size={22}
          color={saved ? colors.primary : colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  text: { flex: 1 },
});
