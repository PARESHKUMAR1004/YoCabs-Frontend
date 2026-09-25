import { z } from 'zod';

/** Indian mobile number as typed by a person: 10 digits, optionally prefixed with +91 / 91. */
export const mobileField = z
  .string()
  .trim()
  .regex(/^(\+?91)?[\s-]?[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

/** Canonical form the API expects: +91XXXXXXXXXX. */
export function normalizeMobile(input: string): string {
  const digits = input.replace(/\D/g, '');
  return `+91${digits.slice(-10)}`;
}

export const requiredText = (label: string, max = 200) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} is too long (max ${max} characters)`);

/**
 * Numeric text input: forms keep numbers as strings while typing; this validates and converts
 * on submit, so screens never call Number() themselves.
 */
export const positiveNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) > 0,
      `${label} must be more than zero`,
    )
    .transform(Number);

export const optionalPositiveNumber = (label: string) =>
  z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (Number.isFinite(Number(value)) && Number(value) > 0),
      `${label} must be more than zero`,
    )
    .transform((value) => (value === '' ? undefined : Number(value)));

export const wholeNumberInRange = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine(
      (value) => /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max,
      `${label} must be between ${min} and ${max}`,
    )
    .transform(Number);
