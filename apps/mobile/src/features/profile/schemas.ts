import { z } from 'zod';
import { requiredText } from '@/shared/forms/zod';

export const profileSchema = z.object({
  displayName: requiredText('Your name', 100),
  email: z
    .string()
    .trim()
    .max(254)
    .refine(
      (value) => value === '' || z.email().safeParse(value).success,
      'Enter a valid email address',
    ),
});
export type ProfileForm = z.input<typeof profileSchema>;
export type ProfileValues = z.output<typeof profileSchema>;
