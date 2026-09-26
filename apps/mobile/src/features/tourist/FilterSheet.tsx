import type { SearchOption, VehicleCategory } from '@yocabs/api-client';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from '@/config/brand';
import { AppText, Button, Chip } from '@/shared/ui';
import { formatMoney } from '@/shared/utils/format';
import { categoryLabel } from '@/shared/utils/labels';
import {
  applyFilters,
  categoriesIn,
  DEFAULT_FILTERS,
  facilitiesIn,
  priceLimits,
  type ResultFilters,
} from './resultFilters';
import type { SortMode } from './sortOptions';

const SORTS: { value: SortMode; label: string }[] = [
  { value: 'price', label: 'Lowest price' },
  { value: 'priceDesc', label: 'Highest price' },
  { value: 'rating', label: 'Top rated' },
];
const RATINGS = [
  { value: 0, label: 'Any' },
  { value: 4, label: '4.0 +' },
  { value: 4.5, label: '4.5 +' },
];
const SEATS = [
  { value: 0, label: 'Any' },
  { value: 4, label: '4 +' },
  { value: 6, label: '6 +' },
  { value: 7, label: '7 +' },
];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <AppText variant="caption" color="textMuted" style={styles.groupTitle}>
        {title}
      </AppText>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

/**
 * Sorting and narrowing the results in one place. Changes are tried out on a copy, with a live
 * count of the cabs they would leave, and only applied when the tourist taps the button.
 */
export function FilterSheet({
  visible,
  options,
  filters,
  onApply,
  onClose,
}: {
  visible: boolean;
  /** Everything the search found, before any filter. */
  options: SearchOption[];
  filters: ResultFilters;
  onApply: (filters: ResultFilters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(filters);

  // Each time the sheet opens it starts from what is currently applied.
  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const set = (change: Partial<ResultFilters>) =>
    setDraft((current) => ({ ...current, ...change }));

  const categories = categoriesIn(options);
  const facilities = facilitiesIn(options);
  const limits = priceLimits(options);
  const remaining = applyFilters(options, draft).length;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close filters">
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.handle} />
            <AppText variant="heading" style={styles.title}>
              Sort and filter
            </AppText>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              <Group title="Sort by">
                {SORTS.map((sort) => (
                  <Chip
                    key={sort.value}
                    label={sort.label}
                    selected={draft.sort === sort.value}
                    onPress={() => set({ sort: sort.value })}
                  />
                ))}
              </Group>

              {categories.length > 1 ? (
                <Group title="Vehicle type">
                  {categories.map((category: VehicleCategory) => (
                    <Chip
                      key={category}
                      label={categoryLabel(category)}
                      selected={draft.categories.includes(category)}
                      onPress={() => set({ categories: toggle(draft.categories, category) })}
                    />
                  ))}
                </Group>
              ) : null}

              {limits.length > 0 ? (
                <Group title="Price">
                  <Chip
                    label="Any"
                    selected={draft.maxPrice === null}
                    onPress={() => set({ maxPrice: null })}
                  />
                  {limits.map((limit) => (
                    <Chip
                      key={limit}
                      label={`Up to ${formatMoney(limit)}`}
                      selected={draft.maxPrice === limit}
                      onPress={() => set({ maxPrice: limit })}
                    />
                  ))}
                </Group>
              ) : null}

              <Group title="Rating">
                {RATINGS.map((rating) => (
                  <Chip
                    key={rating.value}
                    label={rating.label}
                    selected={draft.minRating === rating.value}
                    onPress={() => set({ minRating: rating.value })}
                  />
                ))}
              </Group>

              <Group title="Seats">
                {SEATS.map((seats) => (
                  <Chip
                    key={seats.value}
                    label={seats.label}
                    selected={draft.minSeats === seats.value}
                    onPress={() => set({ minSeats: seats.value })}
                  />
                ))}
              </Group>

              {facilities.length > 0 ? (
                <Group title="Facilities">
                  {facilities.map((facility) => (
                    <Chip
                      key={facility.code}
                      label={facility.name}
                      selected={draft.facilityCodes.includes(facility.code)}
                      onPress={() =>
                        set({ facilityCodes: toggle(draft.facilityCodes, facility.code) })
                      }
                    />
                  ))}
                </Group>
              ) : null}
            </ScrollView>

            <View style={styles.footer}>
              <Button
                title="Reset"
                variant="ghost"
                onPress={() => setDraft(DEFAULT_FILTERS)}
                style={styles.reset}
              />
              <Button
                title={
                  remaining === 0
                    ? 'No cabs match'
                    : `Show ${remaining} ${remaining === 1 ? 'cab' : 'cabs'}`
                }
                disabled={remaining === 0}
                onPress={() => onApply(draft)}
                style={styles.apply}
                testID="apply-filters"
              />
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    ...shadow.raised,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  title: { marginBottom: spacing.sm },
  scroll: { flexGrow: 0 },
  group: { marginBottom: spacing.lg },
  groupTitle: { textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  footer: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md },
  reset: { flex: 1 },
  apply: { flex: 2 },
});
