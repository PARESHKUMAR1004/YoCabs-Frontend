import { z } from 'zod';
import {
  mobileField,
  optionalPositiveNumber,
  positiveNumber,
  requiredText,
  wholeNumberInRange,
} from '@/shared/forms/zod';

export const vehicleSchema = z.object({
  registrationNumber: requiredText('Registration number', 20).transform((value) =>
    value.toUpperCase(),
  ),
  make: requiredText('Make', 50),
  model: requiredText('Model', 50),
  category: z.enum(['SEDAN', 'SUV', 'MUV', 'TEMPO_TRAVELLER', 'BUS']),
  passengerCapacity: wholeNumberInRange('Seats', 1, 60),
});
export type VehicleForm = z.input<typeof vehicleSchema>;
export type VehicleValues = z.output<typeof vehicleSchema>;

export const driverSchema = z.object({
  name: requiredText('Name', 100),
  mobile: mobileField,
  licenseNumber: requiredText('Licence number', 30),
});
export type DriverForm = z.input<typeof driverSchema>;
export type DriverValues = z.output<typeof driverSchema>;

export const staffSchema = z.object({
  name: requiredText('Name', 100),
  mobile: mobileField,
});
export type StaffForm = z.input<typeof staffSchema>;

export const serviceAreaSchema = z.object({
  name: requiredText('Area name', 100),
  latitude: z
    .string()
    .trim()
    .refine(
      (value) => value !== '' && Math.abs(Number(value)) <= 90,
      'Latitude must be between -90 and 90',
    )
    .transform(Number),
  longitude: z
    .string()
    .trim()
    .refine(
      (value) => value !== '' && Math.abs(Number(value)) <= 180,
      'Longitude must be between -180 and 180',
    )
    .transform(Number),
  radiusKm: positiveNumber('Radius'),
});
export type ServiceAreaForm = z.input<typeof serviceAreaSchema>;
export type ServiceAreaValues = z.output<typeof serviceAreaSchema>;

const optionalWholeNumber = (label: string) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d+$/.test(value), `${label} must be a whole number`)
    .transform((value) => (value === '' ? undefined : Number(value)));

export const vehicleProfileSchema = z.object({
  modelYear: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (/^\d{4}$/.test(value) && Number(value) >= 1990),
      'Enter a 4-digit year',
    )
    .transform((value) => (value === '' ? undefined : Number(value))),
  luggageCapacity: optionalWholeNumber('Luggage'),
});
export type VehicleProfileForm = z.input<typeof vehicleProfileSchema>;
export type VehicleProfileValues = z.output<typeof vehicleProfileSchema>;

/** Every price field is optional in the form; which ones matter depends on the trip type. */
export const pricingSchema = z.object({
  baseFee: optionalPositiveNumber('Base fee'),
  perKmCharge: optionalPositiveNumber('Per-km charge'),
  driverAllowance: optionalPositiveNumber('Driver allowance'),
  minimumBillableKm: optionalPositiveNumber('Minimum km'),
  includedDurationMinutes: optionalPositiveNumber('Included minutes'),
  includedDistanceKm: optionalPositiveNumber('Included km'),
  packagePrice: optionalPositiveNumber('Package price'),
  extraHourCharge: optionalPositiveNumber('Extra hour charge'),
  extraKmCharge: optionalPositiveNumber('Extra km charge'),
});
export type PricingForm = z.input<typeof pricingSchema>;
export type PricingValues = z.output<typeof pricingSchema>;
