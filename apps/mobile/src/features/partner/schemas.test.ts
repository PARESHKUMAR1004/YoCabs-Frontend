import { pricingDefaults, PRICING_FIELDS } from './pricingFields';
import { driverSchema, pricingSchema, serviceAreaSchema, vehicleSchema } from './schemas';

describe('vehicleSchema', () => {
  const valid = {
    registrationNumber: 'od02ab1234',
    make: 'Toyota',
    model: 'Innova',
    category: 'MUV',
    passengerCapacity: '7',
  };

  it('normalises the registration number and parses seats', () => {
    const parsed = vehicleSchema.parse(valid);
    expect(parsed.registrationNumber).toBe('OD02AB1234');
    expect(parsed.passengerCapacity).toBe(7);
  });

  it('rejects an unknown category and impossible seat counts', () => {
    expect(vehicleSchema.safeParse({ ...valid, category: 'ROCKET' }).success).toBe(false);
    expect(vehicleSchema.safeParse({ ...valid, passengerCapacity: '0' }).success).toBe(false);
  });
});

describe('driverSchema', () => {
  it('requires a valid mobile number', () => {
    const base = { name: 'Ravi', licenseNumber: 'OD1234' };
    expect(driverSchema.safeParse({ ...base, mobile: '9876543210' }).success).toBe(true);
    expect(driverSchema.safeParse({ ...base, mobile: '123' }).success).toBe(false);
  });
});

describe('serviceAreaSchema', () => {
  it('bounds latitude and longitude', () => {
    const base = { name: 'Puri', radiusKm: '40' };
    expect(
      serviceAreaSchema.safeParse({ ...base, latitude: '19.8', longitude: '85.8' }).success,
    ).toBe(true);
    expect(
      serviceAreaSchema.safeParse({ ...base, latitude: '95', longitude: '85.8' }).success,
    ).toBe(false);
    expect(serviceAreaSchema.safeParse({ ...base, latitude: '19.8', longitude: '' }).success).toBe(
      false,
    );
  });
});

describe('pricing', () => {
  it('treats blank prices as not set', () => {
    const parsed = pricingSchema.parse({
      ...pricingDefaults(undefined),
      baseFee: '600',
      perKmCharge: '20',
    });
    expect(parsed.baseFee).toBe(600);
    expect(parsed.driverAllowance).toBeUndefined();
  });

  it('rejects a zero price', () => {
    expect(pricingSchema.safeParse({ ...pricingDefaults(undefined), baseFee: '0' }).success).toBe(
      false,
    );
  });

  it('asks for package pricing only on rentals', () => {
    expect(PRICING_FIELDS.CHAUFFEUR_RENTAL).toContain('packagePrice');
    expect(PRICING_FIELDS.CHAUFFEUR_ONE_WAY).not.toContain('packagePrice');
  });
});
