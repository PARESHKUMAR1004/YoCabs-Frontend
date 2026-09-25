import { z } from 'zod';
import { mobileField, requiredText } from '@/shared/forms/zod';

export const loginSchema = z.object({
  mobile: mobileField,
});
export type LoginForm = z.input<typeof loginSchema>;

export const otpSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code'),
});
export type OtpForm = z.input<typeof otpSchema>;

export const partnerRegistrationSchema = z.object({
  ownerName: requiredText('Your name', 100),
  businessName: requiredText('Business name'),
  mobile: mobileField,
});
export type PartnerRegistrationForm = z.input<typeof partnerRegistrationSchema>;
