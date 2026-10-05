import type { VehicleCategory } from '@yocabs/api-client';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, shadow, spacing } from '@/config/brand';
import { brandKey, carName, modelKey } from '@/features/tourist/carModel';
import type { Place } from '@/shared/places';
import { api } from '@/shared/api/client';
import { AppText, ChoiceChips, LoadingView } from '@/shared/ui';
import { categoryLabel } from '@/shared/utils/labels';
import { brandsOfCars, categoriesOfCars, groupCarsByModel, type CarModel } from './carModels';
import { useExploreVehicles } from './hooks';
import { useBookFromExplore } from './useBookFromExplore';

function ModelTile({ car, onPress }: { car: CarModel; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${carName(car.make, car.model)}, ${car.cabCount} cabs`}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      testID={`model-${car.model}`}
    >
      {car.photo ? (
        <Image source={{ uri: api.assetUrl(car.photo) }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={[styles.photo, styles.noPhoto]}>
          <Ionicons name="car-sport" size={28} color={colors.primary} />
        </View>
      )}
      <View style={styles.body}>
        <AppText variant="subheading" numberOfLines={1}>
          {car.model}
        </AppText>
        <AppText variant="small" color="textMuted" numberOfLines={1}>
          {car.make}
        </AppText>
        <AppText variant="small" color="primaryDark" style={styles.count}>
          {car.cabCount} {car.cabCount === 1 ? 'cab' : 'cabs'} · {car.partnerCount}{' '}
          {car.partnerCount === 1 ? 'partner' : 'partners'}
        </AppText>
      </View>
    </Pressable>
  );
}

/**
 * Explore by the car itself: choose a type (Sedan, SUV...), then a model that is actually
 * available nearby (Dzire, City, Amaze; Creta, XUV700...). Tapping one books that model from
 * whichever partners run it.
 */
export function ExploreCars({ pickup }: { pickup: Place | null }) {
  const query = useExploreVehicles(pickup);
  const book = useBookFromExplore();
  const [chosen, setChosen] = useState<VehicleCategory | undefined>();
  const [chosenBrand, setChosenBrand] = useState<string | undefined>();

  const cars = useMemo(() => query.data ?? [], [query.data]);
  const categories = useMemo(() => categoriesOfCars(cars), [cars]);
  const category = chosen && categories.includes(chosen) ? chosen : categories[0];
  const brands = useMemo(() => brandsOfCars(cars), [cars]);
  const models = useMemo(
    () =>
      groupCarsByModel(cars).filter(
        (model) =>
          model.category === category &&
          (!chosenBrand || brandKey(model.make) === brandKey(chosenBrand)),
      ),
    [cars, category, chosenBrand],
  );

  if (query.isPending) {
    return (
      <View style={styles.status}>
        <LoadingView />
      </View>
    );
  }

  if (query.isError) {
    return <AppText color="textMuted">Could not load the cars. Pull down to try again.</AppText>;
  }

  if (cars.length === 0) {
    return (
      <AppText color="textMuted">
        No cabs are available around here yet. You can still search for one above.
      </AppText>
    );
  }

  return (
    <View>
      <ChoiceChips
        options={categories.map((value) => ({ value, label: categoryLabel(value) }))}
        value={category}
        onChange={(value) => value && setChosen(value)}
      />

      {brands.length > 1 ? (
        <ChoiceChips
          options={brands.map((value) => ({ value, label: value }))}
          value={chosenBrand}
          onChange={setChosenBrand}
          allowClear
        />
      ) : null}

      {models.length === 0 ? (
        <AppText color="textMuted" style={styles.noBrandMatch}>
          No {categoryLabel(category).toLowerCase()} from {chosenBrand} nearby. Try another brand.
        </AppText>
      ) : null}

      <View style={styles.grid}>
        {models.map((car) => (
          <ModelTile
            key={car.key}
            car={car}
            onPress={() =>
              book({ modelKey: modelKey(car.model), modelLabel: carName(car.make, car.model) })
            }
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  status: { height: 120 },
  noBrandMatch: { marginTop: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  tile: {
    width: '47.5%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  pressed: { opacity: 0.85 },
  photo: { width: '100%', height: 96, backgroundColor: colors.surface },
  noPhoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink },
  body: { padding: spacing.md },
  count: { marginTop: spacing.xs },
});
