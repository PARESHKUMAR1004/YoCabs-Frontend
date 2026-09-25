import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { spacing } from '@/config/brand';
import { getCurrentPlace } from '@/features/tourist/currentLocation';
import {
  useVehicle,
  useVehicleServiceAreaActions,
  useVehicleServiceAreas,
} from '@/features/partner/hooks';
import {
  serviceAreaSchema,
  type ServiceAreaForm,
  type ServiceAreaValues,
} from '@/features/partner/schemas';
import { MapCanvas, MapPicker, type Coordinate, type MapCircle } from '@/shared/maps';
import { usePlaceAtCoordinate } from '@/shared/places';
import {
  AppText,
  Button,
  Card,
  FormTextField,
  QueryBoundary,
  Row,
  Screen,
  SectionHeader,
  Spacer,
} from '@/shared/ui';
import { confirmAction, showError } from '@/shared/utils/feedback';

function AddArea({ vehicleId, start }: { vehicleId: string; start: Coordinate | null }) {
  const { add } = useVehicleServiceAreaActions(vehicleId);
  const [centre, setCentre] = useState<Coordinate | null>(start);
  const [focus, setFocus] = useState<Coordinate | null>(null);
  const [locating, setLocating] = useState(false);
  const { place } = usePlaceAtCoordinate(centre, 'Service area centre');

  const { control, handleSubmit, watch, setValue, reset } = useForm<
    ServiceAreaForm,
    unknown,
    ServiceAreaValues
  >({
    resolver: zodResolver(serviceAreaSchema),
    defaultValues: { name: '', latitude: '', longitude: '', radiusKm: '50' },
  });

  function moveCentre(coordinate: Coordinate) {
    setCentre(coordinate);
    setValue('latitude', String(coordinate.latitude), { shouldValidate: true });
    setValue('longitude', String(coordinate.longitude), { shouldValidate: true });
  }

  async function centreOnMe() {
    setLocating(true);
    try {
      const here = await getCurrentPlace();
      moveCentre(here);
      setFocus({ latitude: here.latitude, longitude: here.longitude });
    } catch (error) {
      showError(error, 'Could not get your location');
    } finally {
      setLocating(false);
    }
  }

  const typedRadius = Number(watch('radiusKm'));
  const radiusKm = Number.isFinite(typedRadius) && typedRadius > 0 ? typedRadius : 25;

  const onSave = handleSubmit((values) =>
    add.mutate(values, {
      onSuccess: () => reset(),
      onError: (error) => showError(error, 'Could not add the area'),
    }),
  );

  return (
    <Card>
      <AppText variant="subheading">Add an area</AppText>
      <Spacer size="sm" />
      <MapPicker
        value={centre}
        onChange={moveCentre}
        radiusKm={radiusKm}
        focus={focus}
        height={240}
        hint="Tap or drag the map to the centre of the area this vehicle covers."
      />
      <Spacer size="sm" />
      <AppText variant="small" color="textMuted">
        {centre
          ? `Centre: ${place?.name ?? 'Locating…'} (${centre.latitude.toFixed(4)}, ${centre.longitude.toFixed(4)})`
          : 'Move the map to set the centre.'}
      </AppText>
      <Button
        title="Centre on my location"
        variant="ghost"
        loading={locating}
        onPress={() => void centreOnMe()}
      />
      <Spacer size="sm" />
      <FormTextField control={control} name="name" label="Area name" autoCapitalize="words" />
      <FormTextField
        control={control}
        name="radiusKm"
        label="Radius (km)"
        keyboardType="decimal-pad"
      />
      <Button
        title="Add area"
        disabled={!centre}
        loading={add.isPending}
        onPress={() => void onSave()}
      />
    </Card>
  );
}

export default function VehicleServiceAreas() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicle = useVehicle(id);
  const areas = useVehicleServiceAreas(id);
  const { remove } = useVehicleServiceAreaActions(id);

  const onRemove = async (areaId: string, name: string) => {
    if (
      await confirmAction(
        'Remove this area?',
        `This vehicle will stop appearing for pickups around ${name}.`,
        'Remove',
        true,
      )
    ) {
      remove.mutate(areaId, { onError: (error) => showError(error) });
    }
  };

  return (
    <QueryBoundary query={areas}>
      {(list) => {
        const circles: MapCircle[] = list.map((area) => ({
          latitude: area.latitude,
          longitude: area.longitude,
          radiusKm: area.radiusKm,
        }));

        return (
          <Screen>
            <AppText color="textMuted">
              {vehicle.data
                ? `${vehicle.data.make} ${vehicle.data.model} appears in searches for pickups inside these areas.`
                : 'This vehicle appears in searches for pickups inside these areas.'}
            </AppText>
            <Spacer size="sm" />

            {circles.length ? (
              <MapCanvas
                circles={circles}
                markers={list.map((area) => ({
                  id: area.id,
                  kind: 'centre' as const,
                  label: area.name,
                  latitude: area.latitude,
                  longitude: area.longitude,
                }))}
                height={200}
                interactive={false}
                testID="vehicle-area-map"
              />
            ) : (
              <AppText color="warning">
                No area set yet, so this vehicle never appears in a search.
              </AppText>
            )}

            <SectionHeader title="Areas" />
            {list.map((area) => (
              <Card key={area.id}>
                <Row style={styles.row}>
                  <AppText variant="subheading">{area.name}</AppText>
                  <Button
                    title="Remove"
                    variant="ghost"
                    onPress={() => void onRemove(area.id, area.name)}
                  />
                </Row>
                <AppText color="textMuted">
                  Within {area.radiusKm} km of {area.latitude.toFixed(3)},{' '}
                  {area.longitude.toFixed(3)}
                </AppText>
              </Card>
            ))}

            <AddArea vehicleId={id} start={circles[0] ?? null} />
          </Screen>
        );
      }}
    </QueryBoundary>
  );
}

const styles = StyleSheet.create({
  row: { justifyContent: 'space-between', marginBottom: spacing.xs },
});
