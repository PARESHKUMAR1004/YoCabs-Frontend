import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import type { FuelType, Transmission, VehicleProfile } from '@yocabs/api-client';
import { useFacilities, useSaveVehicleProfile, useVehicleProfile } from '@/features/partner/hooks';
import {
  vehicleProfileSchema,
  type VehicleProfileForm,
  type VehicleProfileValues,
} from '@/features/partner/schemas';
import {
  AppText,
  Button,
  Chip,
  ChoiceChips,
  FormTextField,
  QueryBoundary,
  Screen,
  Spacer,
} from '@/shared/ui';
import { showError } from '@/shared/utils/feedback';

const FUEL: { value: FuelType; label: string }[] = [
  { value: 'PETROL', label: 'Petrol' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'CNG', label: 'CNG' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
];
const TRANSMISSION: { value: Transmission; label: string }[] = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'AUTOMATIC', label: 'Automatic' },
];

function DetailsForm({ vehicleId, profile }: { vehicleId: string; profile: VehicleProfile }) {
  const save = useSaveVehicleProfile(vehicleId);
  const facilities = useFacilities();
  const [fuel, setFuel] = useState<FuelType | undefined>(profile.fuelType ?? undefined);
  const [transmission, setTransmission] = useState<Transmission | undefined>(
    profile.transmission ?? undefined,
  );
  const [codes, setCodes] = useState<string[]>(profile.facilities.map((facility) => facility.code));

  const { control, handleSubmit } = useForm<VehicleProfileForm, unknown, VehicleProfileValues>({
    resolver: zodResolver(vehicleProfileSchema),
    defaultValues: {
      modelYear: profile.modelYear ? String(profile.modelYear) : '',
      luggageCapacity: profile.luggageCapacity !== null ? String(profile.luggageCapacity) : '',
    },
  });

  const toggle = (code: string) =>
    setCodes((current) =>
      current.includes(code) ? current.filter((c) => c !== code) : [...current, code],
    );

  const onSave = handleSubmit((values) =>
    save.mutate(
      {
        fuelType: fuel ?? null,
        transmission: transmission ?? null,
        modelYear: values.modelYear ?? null,
        luggageCapacity: values.luggageCapacity ?? null,
        facilityCodes: codes,
      },
      { onSuccess: () => router.back(), onError: (error) => showError(error, 'Could not save') },
    ),
  );

  return (
    <Screen footer={<Button title="Save" loading={save.isPending} onPress={() => void onSave()} />}>
      <AppText variant="caption" color="textMuted">
        Fuel
      </AppText>
      <ChoiceChips options={FUEL} value={fuel} onChange={setFuel} allowClear />
      <Spacer size="sm" />
      <AppText variant="caption" color="textMuted">
        Transmission
      </AppText>
      <ChoiceChips
        options={TRANSMISSION}
        value={transmission}
        onChange={setTransmission}
        allowClear
      />
      <Spacer />
      <FormTextField
        control={control}
        name="modelYear"
        label="Model year"
        keyboardType="number-pad"
      />
      <FormTextField
        control={control}
        name="luggageCapacity"
        label="Luggage capacity (bags)"
        keyboardType="number-pad"
      />

      <AppText variant="caption" color="textMuted">
        Facilities on board
      </AppText>
      {(facilities.data ?? [])
        .filter((facility) => facility.active)
        .map((facility) => (
          <Chip
            key={facility.code}
            label={facility.name}
            selected={codes.includes(facility.code)}
            onPress={() => toggle(facility.code)}
          />
        ))}
    </Screen>
  );
}

export default function VehicleDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useVehicleProfile(id);

  return (
    <QueryBoundary query={query}>
      {(profile) => <DetailsForm vehicleId={id} profile={profile} />}
    </QueryBoundary>
  );
}
