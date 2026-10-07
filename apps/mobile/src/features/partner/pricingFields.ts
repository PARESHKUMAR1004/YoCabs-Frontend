import type { PricingConfiguration, PricingConfigurationInput, TripType } from '@yocabs/api-client';
import type { PricingForm } from './schemas';

export type PricingField = keyof PricingForm;

export const PRICING_FIELD_LABELS: Record<PricingField, string> = {
  baseFee: 'Base fee (INR)',
  perKmCharge: 'Charge per km (INR)',
  driverAllowance: 'Driver allowance per day (INR)',
  minimumBillableKm: 'Minimum billable km',
  includedDurationHours: 'Included duration (hours)',
  includedDistanceKm: 'Included distance (km)',
  packagePrice: 'Package price (INR)',
  extraHourCharge: 'Extra hour charge (INR)',
  extraKmCharge: 'Extra km charge (INR)',
};

/** Which inputs each trip type prices on. */
export const PRICING_FIELDS: Record<TripType, PricingField[]> = {
  CHAUFFEUR_ONE_WAY: ['baseFee', 'perKmCharge', 'driverAllowance', 'minimumBillableKm'],
  CHAUFFEUR_ROUND_TRIP: ['baseFee', 'perKmCharge', 'driverAllowance', 'minimumBillableKm'],
  CHAUFFEUR_RENTAL: [
    'packagePrice',
    'includedDurationHours',
    'includedDistanceKm',
    'extraHourCharge',
    'extraKmCharge',
    'driverAllowance',
  ],
};

/**
 * A travel partner thinks in hours for a rental package ("an 8-hour package"), but the API
 * stores it in minutes (so the pricing engine can work in one unit throughout). The conversion
 * happens only at this form boundary - see `toPricingInput` for the reverse direction.
 */
const MINUTES_PER_HOUR = 60;

/** Form defaults from a saved configuration (empty strings for anything not set). */
export function pricingDefaults(config: PricingConfiguration | undefined): PricingForm {
  const text = (value: number | null | undefined) =>
    value === null || value === undefined ? '' : String(value);

  return {
    baseFee: text(config?.baseFee),
    perKmCharge: text(config?.perKmCharge),
    driverAllowance: text(config?.driverAllowance),
    minimumBillableKm: text(config?.minimumBillableKm),
    includedDurationHours: text(
      config?.includedDurationMinutes === null || config?.includedDurationMinutes === undefined
        ? null
        : config.includedDurationMinutes / MINUTES_PER_HOUR,
    ),
    includedDistanceKm: text(config?.includedDistanceKm),
    packagePrice: text(config?.packagePrice),
    extraHourCharge: text(config?.extraHourCharge),
    extraKmCharge: text(config?.extraKmCharge),
  };
}

/** Builds the API input from the form's values, converting hours back to the minutes the API expects. */
export function toPricingInput(
  fields: PricingField[],
  values: Partial<Record<PricingField, number | undefined>>,
): Omit<PricingConfigurationInput, 'vehicleId' | 'tripType'> {
  const input: Omit<PricingConfigurationInput, 'vehicleId' | 'tripType'> = {};

  for (const field of fields) {
    const value = values[field];
    if (value === undefined) continue;

    if (field === 'includedDurationHours') {
      input.includedDurationMinutes = value * MINUTES_PER_HOUR;
    } else {
      input[field] = value;
    }
  }

  return input;
}
