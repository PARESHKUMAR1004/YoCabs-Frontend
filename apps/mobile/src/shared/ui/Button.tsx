import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '@/config/brand';
import { AppText } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'outlineLight';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const palette: Record<Variant, { bg: string; fg: keyof typeof colors; border: string }> = {
  primary: { bg: colors.ink, fg: 'textOnPrimary', border: colors.ink },
  secondary: { bg: colors.card, fg: 'ink', border: colors.primary },
  ghost: { bg: 'transparent', fg: 'primaryDark', border: 'transparent' },
  danger: { bg: colors.danger, fg: 'textOnPrimary', border: colors.danger },
  // For dark surfaces such as the welcome screen and the home header.
  gold: { bg: colors.primary, fg: 'ink', border: colors.primary },
  outlineLight: { bg: 'transparent', fg: 'textOnPrimary', border: colors.primary },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  testID,
}: Props) {
  const inactive = disabled || loading;
  const look = palette[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: look.bg, borderColor: look.border },
        variant === 'primary' && shadow.card,
        pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
        inactive && { opacity: 0.45 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[look.fg]} />
      ) : (
        <AppText variant="subheading" color={look.fg} style={styles.label}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: { letterSpacing: 0.3 },
});
