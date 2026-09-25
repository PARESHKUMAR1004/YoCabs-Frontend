import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import { DateField } from './DateField';
import { TextField } from './TextField';

/**
 * `TOut` is the shape after schema transforms (strings parsed to numbers, ...). Forms keep the raw
 * input shape in `T`, and only the field wiring here needs to know about both.
 */
interface TextProps<T extends FieldValues, TOut extends FieldValues | undefined> extends Omit<
  TextInputProps,
  'value' | 'onChangeText'
> {
  control: Control<T, unknown, TOut>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
}

/** react-hook-form connected text input: shows the field's validation error automatically. */
export function FormTextField<T extends FieldValues, TOut extends FieldValues | undefined = T>({
  control,
  name,
  label,
  hint,
  ...input
}: TextProps<T, TOut>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          label={label}
          hint={hint}
          error={fieldState.error?.message}
          value={field.value === undefined || field.value === null ? '' : String(field.value)}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          {...input}
        />
      )}
    />
  );
}

interface DateProps<T extends FieldValues, TOut extends FieldValues | undefined> {
  control: Control<T, unknown, TOut>;
  name: FieldPath<T>;
  label: string;
  minimumDate?: string;
}

export function FormDateField<T extends FieldValues, TOut extends FieldValues | undefined = T>({
  control,
  name,
  label,
  minimumDate,
}: DateProps<T, TOut>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <DateField
          label={label}
          value={String(field.value)}
          onChange={field.onChange}
          minimumDate={minimumDate}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
