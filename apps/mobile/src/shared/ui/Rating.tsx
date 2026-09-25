import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/config/brand';
import { AppText } from './Text';

/** Read-only rating: star + value + review count. */
export function RatingBadge({ rating, count }: { rating: number; count?: number }) {
  if (count === 0) {
    return (
      <AppText variant="caption" color="textMuted">
        New
      </AppText>
    );
  }

  return (
    <View style={styles.row} accessibilityLabel={`Rated ${rating.toFixed(1)} out of 5`}>
      <Ionicons name="star" size={14} color={colors.warning} />
      <AppText variant="caption" style={styles.value}>
        {rating.toFixed(1)}
      </AppText>
      {count !== undefined ? (
        <AppText variant="caption" color="textMuted">
          {' '}
          ({count})
        </AppText>
      ) : null}
    </View>
  );
}

/** Tap-to-rate control (1-5). */
export function RatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          accessibilityRole="button"
          accessibilityLabel={`${star} star${star > 1 ? 's' : ''}`}
          onPress={() => onChange(star)}
          hitSlop={8}
        >
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={36}
            color={star <= value ? colors.warning : colors.border}
            style={styles.star}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  value: { marginLeft: 2, fontWeight: '700' },
  star: { marginRight: spacing.xs },
});
