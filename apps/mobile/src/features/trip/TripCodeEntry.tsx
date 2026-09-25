import { useState } from 'react';
import { AppText, Button, Card, TextField } from '@/shared/ui';

export const TRIP_CODE_LENGTH = 6;

/** Where the person operating a trip types in the code the tourist reads out. */
export function TripCodeEntry({
  heading,
  hint,
  buttonTitle,
  loading,
  disabled,
  onSubmit,
}: {
  heading: string;
  hint: string;
  buttonTitle: string;
  loading?: boolean;
  disabled?: boolean;
  onSubmit: (code: string) => void;
}) {
  const [code, setCode] = useState('');

  return (
    <Card>
      <AppText variant="subheading">{heading}</AppText>
      <TextField
        label="Code from the traveller"
        value={code}
        onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, TRIP_CODE_LENGTH))}
        keyboardType="number-pad"
        maxLength={TRIP_CODE_LENGTH}
        placeholder="6-digit code"
        hint={hint}
        testID="trip-code"
      />
      <Button
        title={buttonTitle}
        loading={loading}
        disabled={disabled || code.length !== TRIP_CODE_LENGTH}
        onPress={() => onSubmit(code)}
        testID="trip-code-submit"
      />
    </Card>
  );
}
