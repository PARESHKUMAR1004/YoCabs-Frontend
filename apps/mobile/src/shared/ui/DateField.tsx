import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, radius, spacing } from '@/config/brand';
import { formatDate, parseIsoDate, toIsoDate } from '@/shared/utils/format';
import { AppText } from './Text';

interface Props {
  label: string;
  /** yyyy-MM-dd */
  value: string;
  onChange: (isoDate: string) => void;
  minimumDate?: string;
  error?: string;
}

/** Native date picker that speaks ISO date strings. */
export function DateField({ label, value, onChange, minimumDate, error }: Props) {
  const [open, setOpen] = useState(false);

  function handle(event: DateTimePickerEvent, date?: Date) {
    setOpen(false);
    if (event.type === 'set' && date) onChange(toIsoDate(date));
  }

  return (
    <View style={styles.wrapper}>
      <AppText variant="caption" color="textMuted" style={styles.label}>
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatDate(value)}`}
        onPress={() => setOpen(true)}
        style={[styles.input, !!error && styles.error]}
      >
        <AppText>{formatDate(value)}</AppText>
      </Pressable>
      {error ? (
        <AppText variant="small" color="danger" style={styles.label}>
          {error}
        </AppText>
      ) : null}
      {open ? (
        <DateTimePicker
          value={parseIsoDate(value)}
          mode="date"
          minimumDate={minimumDate ? parseIsoDate(minimumDate) : undefined}
          onChange={handle}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { marginBottom: spacing.xs },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  error: { borderColor: colors.danger },
});
