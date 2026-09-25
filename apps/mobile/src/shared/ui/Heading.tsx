import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/config/brand';
import { AppText } from './Text';

/** The opening of a screen: a small gold label, a serif title, a gold rule and a line of context. */
export function Heading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.wrapper}>
      {eyebrow ? (
        <AppText variant="caption" color="primaryDark" style={styles.eyebrow}>
          {eyebrow}
        </AppText>
      ) : null}
      <AppText variant="title">{title}</AppText>
      <View style={styles.rule} />
      {subtitle ? <AppText color="textMuted">{subtitle}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  eyebrow: { textTransform: 'uppercase', letterSpacing: 2, marginBottom: spacing.xs },
  rule: { width: 40, height: 2, backgroundColor: colors.primary, marginVertical: spacing.md },
});
