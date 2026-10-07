import type { PricingConfiguration } from '@yocabs/api-client';
import { pricingDefaults, PRICING_FIELDS, toPricingInput } from './pricingFields';

const config = (overrides: Partial<PricingConfiguration> = {}): PricingConfiguration =>
  ({
    id: 'p1',
    vehicleId: 'v1',
    tripType: 'CHAUFFEUR_RENTAL',
    active: true,
    baseFee: null,
    perKmCharge: null,
    driverAllowance: null,
    minimumBillableKm: null,
    includedDurationMinutes: null,
    includedDistanceKm: null,
    packagePrice: null,
    extraHourCharge: null,
    extraKmCharge: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }) as PricingConfiguration;

describe('pricingDefaults', () => {
  it('shows a stored duration in minutes to a partner as hours', () => {
    const defaults = pricingDefaults(config({ includedDurationMinutes: 480 }));
    expect(defaults.includedDurationHours).toBe('8');
  });

  it('leaves the field blank when nothing is set yet', () => {
    expect(pricingDefaults(undefined).includedDurationHours).toBe('');
    expect(pricingDefaults(config()).includedDurationHours).toBe('');
  });

  it('leaves every other field as-is (no unit conversion)', () => {
    const defaults = pricingDefaults(config({ packagePrice: 5000, extraHourCharge: 300 }));
    expect(defaults.packagePrice).toBe('5000');
    expect(defaults.extraHourCharge).toBe('300');
  });
});

describe('toPricingInput', () => {
  it('converts the hours a partner enters back to the minutes the API stores', () => {
    const input = toPricingInput(PRICING_FIELDS.CHAUFFEUR_RENTAL, {
      includedDurationHours: 8,
      packagePrice: 5000,
    });
    expect(input.includedDurationMinutes).toBe(480);
    expect(input.packagePrice).toBe(5000);
    expect(input).not.toHaveProperty('includedDurationHours');
  });

  it('omits a field the partner left blank', () => {
    const input = toPricingInput(PRICING_FIELDS.CHAUFFEUR_RENTAL, { packagePrice: 5000 });
    expect(input.includedDurationMinutes).toBeUndefined();
  });
});
