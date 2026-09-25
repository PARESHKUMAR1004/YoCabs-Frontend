import type { Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius, spacing } from '@/config/brand';
import { AppText } from './Text';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  /** Lets a screen move focus here, e.g. from the pickup field to the drop field. */
  ref?: Ref<TextInput>;
}

export function TextField({ label, error, hint, style, ref, ...input }: Props) {
  return (
    <View style={styles.wrapper}>
      <AppText variant="caption" color="textMuted" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        {...input}
        style={[
          styles.input,
          !!error && styles.inputError,
          input.multiline && styles.multiline,
          style,
        ]}
      />
      {error ? (
        <AppText variant="small" color="danger" style={styles.message}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="small" color="textMuted" style={styles.message}>
          {hint}
        </AppText>
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
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputError: { borderColor: colors.danger },
  multiline: { minHeight: 96, paddingTop: spacing.md, textAlignVertical: 'top' },
  message: { marginTop: spacing.xs },
});
