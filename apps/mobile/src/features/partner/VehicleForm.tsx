import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import type { Vehicle } from '@yocabs/api-client';
import { AppText, Button, ChoiceChips, FormTextField, Screen } from '@/shared/ui';
import { showError } from '@/shared/utils/feedback';
import { VEHICLE_CATEGORY_OPTIONS } from '@/shared/utils/labels';
import { useSaveVehicle } from './hooks';
import { vehicleSchema, type VehicleForm as Form, type VehicleValues } from './schemas';

interface Props {
  /** Present when editing. */
  vehicle?: Vehicle;
  onSaved: (vehicle: Vehicle) => void;
}

export function VehicleForm({ vehicle, onSaved }: Props) {
  const save = useSaveVehicle(vehicle?.id);
  const { control, handleSubmit } = useForm<Form, unknown, VehicleValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      registrationNumber: vehicle?.registrationNumber ?? '',
      make: vehicle?.make ?? '',
      model: vehicle?.model ?? '',
      category: vehicle?.category ?? 'SEDAN',
      passengerCapacity: vehicle ? String(vehicle.passengerCapacity) : '4',
    },
  });

  const onSubmit = handleSubmit((values) =>
    save.mutate(values, {
      onSuccess: onSaved,
      onError: (error) => showError(error, 'Could not save the vehicle'),
    }),
  );

  return (
    <Screen
      footer={
        <Button
          title="Save vehicle"
          loading={save.isPending}
          onPress={() => void onSubmit()}
          testID="save-vehicle"
        />
      }
    >
      <FormTextField
        control={control}
        name="registrationNumber"
        label="Registration number"
        autoCapitalize="characters"
      />
      <FormTextField
        control={control}
        name="make"
        label="Make (e.g. Toyota)"
        autoCapitalize="words"
      />
      <FormTextField
        control={control}
        name="model"
        label="Model (e.g. Innova)"
        autoCapitalize="words"
      />
      <AppText variant="caption" color="textMuted">
        Category
      </AppText>
      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <ChoiceChips
            horizontal={false}
            options={VEHICLE_CATEGORY_OPTIONS}
            value={field.value}
            onChange={(value) => value && field.onChange(value)}
          />
        )}
      />
      <FormTextField
        control={control}
        name="passengerCapacity"
        label="Seats"
        keyboardType="number-pad"
      />
    </Screen>
  );
}
