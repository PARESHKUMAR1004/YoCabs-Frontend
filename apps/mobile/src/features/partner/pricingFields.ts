import type { PricingConfiguration, TripType } from '@yocabs/api-client';
import type { PricingForm } from './schemas';

export type PricingField = keyof PricingForm;

export const PRICING_FIELD_LABELS: Record<PricingField, string> = {
  baseFee: 'Base fee (INR)',
  perKmCharge: 'Charge per km (INR)',
  driverAllowance: 'Driver allowance per day (INR)',
  minimumBillableKm: 'Minimum billable km',
  includedDurationMinutes: 'Included duration (minutes)',
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
    'includedDurationMinutes',
    'includedDistanceKm',
    'extraHourCharge',
    'extraKmCharge',
    'driverAllowance',
  ],
};

/** Form defaults from a saved configuration (empty strings for anything not set). */
export function pricingDefaults(config: PricingConfiguration | undefined): PricingForm {
  const text = (value: number | null | undefined) =>
    value === null || value === undefined ? '' : String(value);

  return {
    baseFee: text(config?.baseFee),
    perKmCharge: text(config?.perKmCharge),
    driverAllowance: text(config?.driverAllowance),
    minimumBillableKm: text(config?.minimumBillableKm),
    includedDurationMinutes: text(config?.includedDurationMinutes),
    includedDistanceKm: text(config?.includedDistanceKm),
    packagePrice: text(config?.packagePrice),
    extraHourCharge: text(config?.extraHourCharge),
    extraKmCharge: text(config?.extraKmCharge),
  };
}
