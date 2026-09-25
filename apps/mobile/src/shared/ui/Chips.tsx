import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/config/brand';
import { AppText } from './Text';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <AppText
        variant="caption"
        color={selected ? 'primaryDark' : 'textMuted'}
        style={styles.chipText}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

interface ChoiceProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  /** Lets the person clear the choice (an "any" state). */
  allowClear?: boolean;
  horizontal?: boolean;
}

/** Single-choice chip group. */
export function ChoiceChips<T extends string>({
  options,
  value,
  onChange,
  allowClear,
  horizontal = true,
}: ChoiceProps<T>) {
  const items = options.map((option) => (
    <Chip
      key={option.value}
      label={option.label}
      selected={value === option.value}
      onPress={() => onChange(allowClear && value === option.value ? undefined : option.value)}
    />
  ));

  return horizontal ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {items}
    </ScrollView>
  ) : (
    <View style={[styles.row, styles.wrap]}>{items}</View>
  );
}

export function Badge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const tones = {
    neutral: { bg: colors.surface, fg: 'textMuted' },
    success: { bg: colors.successSoft, fg: 'success' },
    warning: { bg: colors.warningSoft, fg: 'warning' },
    danger: { bg: colors.dangerSoft, fg: 'danger' },
    info: { bg: colors.infoSoft, fg: 'info' },
  } as const;
  const look = tones[tone];

  return (
    <View style={[styles.badge, { backgroundColor: look.bg }]}>
      <AppText variant="small" color={look.fg} style={styles.badgeText}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  wrap: { flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontWeight: '600' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: { fontWeight: '700' },
});
