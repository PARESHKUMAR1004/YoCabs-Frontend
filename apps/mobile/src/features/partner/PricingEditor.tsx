import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { PricingConfiguration, PricingConfigurationInput, TripType } from '@yocabs/api-client';
import { AppText, Badge, Button, Card, FormTextField, Row, Spacer } from '@/shared/ui';
import { showError, showInfo } from '@/shared/utils/feedback';
import { tripTypeLabel } from '@/shared/utils/labels';
import { useSavePricing, useSetPricingActive } from './hooks';
import { PRICING_FIELDS, PRICING_FIELD_LABELS, pricingDefaults } from './pricingFields';
import { pricingSchema, type PricingForm, type PricingValues } from './schemas';

interface Props {
  vehicleId: string;
  tripType: TripType;
  existing: PricingConfiguration | undefined;
}

/** Price inputs for one trip type of one vehicle. Creates the configuration or updates it. */
export function PricingEditor({ vehicleId, tripType, existing }: Props) {
  const save = useSavePricing(vehicleId);
  const toggle = useSetPricingActive(vehicleId);
  const { control, handleSubmit } = useForm<PricingForm, unknown, PricingValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: pricingDefaults(existing),
  });

  const fields = PRICING_FIELDS[tripType];

  const onSave = handleSubmit((values) => {
    const input: PricingConfigurationInput = { vehicleId, tripType };
    for (const field of fields) {
      const value = values[field];
      if (value !== undefined) input[field] = value;
    }
    save.mutate(
      { id: existing?.id, input },
      {
        onSuccess: () => showInfo('Saved', `${tripTypeLabel(tripType)} pricing updated.`),
        onError: (error) => showError(error, 'Could not save pricing'),
      },
    );
  });

  return (
    <Card>
      <Row style={{ justifyContent: 'space-between' }}>
        <AppText variant="subheading">{tripTypeLabel(tripType)}</AppText>
        {existing ? (
          <Badge
            label={existing.active ? 'Live' : 'Off'}
            tone={existing.active ? 'success' : 'neutral'}
          />
        ) : null}
      </Row>
      <Spacer size="sm" />
      {fields.map((field) => (
        <FormTextField
          key={field}
          control={control}
          name={field}
          label={PRICING_FIELD_LABELS[field]}
          keyboardType="decimal-pad"
        />
      ))}
      <Button title="Save prices" loading={save.isPending} onPress={() => void onSave()} />
      {existing ? (
        <>
          <Spacer size="sm" />
          <Button
            title={existing.active ? 'Turn off this trip type' : 'Turn on this trip type'}
            variant="ghost"
            loading={toggle.isPending}
            onPress={() =>
              toggle.mutate(
                { id: existing.id, active: !existing.active },
                { onError: (error) => showError(error) },
              )
            }
          />
        </>
      ) : null}
    </Card>
  );
}
