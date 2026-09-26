import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from '@/config/brand';
import { AppText } from './Text';

interface ScreenProps {
  children: ReactNode;
  /** Scroll the content (default). Use false when the screen contains a FlatList. */
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  footer?: ReactNode;
}

/** Standard screen: safe area, keyboard handling, optional pull-to-refresh and sticky footer. */
export function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  padded = true,
  footer,
}: ScreenProps) {
  const content = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[padded && styles.padded, styles.grow]}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.flex, styles.ground]} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Card({
  children,
  onPress,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const body = <View style={[styles.card, style]}>{children}</View>;
  if (!onPress) return body;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && { opacity: 0.85 }}
    >
      {body}
    </Pressable>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Spacer({ size = 'md' }: { size?: keyof typeof spacing }) {
  return <View style={{ height: spacing[size] }} />;
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <Row style={styles.sectionHeader}>
      <AppText variant="heading">{title}</AppText>
      {action}
    </Row>
  );
}

/** Label on the left, value on the right (price breakup, booking facts). */
export function KeyValue({
  label,
  value,
  emphasise,
}: {
  label: string;
  value: ReactNode;
  emphasise?: boolean;
}) {
  return (
    <Row style={styles.keyValue}>
      <AppText
        variant={emphasise ? 'subheading' : 'body'}
        color={emphasise ? 'text' : 'textMuted'}
        style={styles.flex}
      >
        {label}
      </AppText>
      {typeof value === 'string' || typeof value === 'number' ? (
        <AppText variant={emphasise ? 'figure' : 'body'}>{value}</AppText>
      ) : (
        value
      )}
    </Row>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
  padded: { padding: spacing.lg },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  ground: { backgroundColor: colors.background },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  sectionHeader: { justifyContent: 'space-between', marginVertical: spacing.md },
  keyValue: { justifyContent: 'space-between', paddingVertical: spacing.xs },
});
