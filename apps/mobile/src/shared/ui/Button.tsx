import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/config/brand';
import { AppText } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

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
  primary: { bg: colors.primary, fg: 'textOnPrimary', border: colors.primary },
  secondary: { bg: colors.background, fg: 'primaryDark', border: colors.primary },
  ghost: { bg: 'transparent', fg: 'primaryDark', border: 'transparent' },
  danger: { bg: colors.danger, fg: 'textOnPrimary', border: colors.danger },
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
        pressed && { opacity: 0.85 },
        inactive && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[look.fg]} />
      ) : (
        <AppText variant="subheading" color={look.fg}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
