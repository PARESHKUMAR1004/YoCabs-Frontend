import { useState, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius, spacing } from '@/config/brand';
import { AppText } from './Text';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  /** Lets a screen move focus here, e.g. from the pickup field to the drop field. */
  ref?: Ref<TextInput>;
}

export function TextField({ label, error, hint, style, ref, onFocus, onBlur, ...input }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <AppText variant="caption" color="textMuted" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        {...input}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          focused && styles.inputFocused,
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
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.danger },
  multiline: { minHeight: 96, paddingTop: spacing.md, textAlignVertical: 'top' },
  message: { marginTop: spacing.xs },
});
