import { StyleSheet, View } from 'react-native';
import { spacing } from '@/config/brand';
import { buildDetail, buildInfo, buildLabel } from '@/shared/utils/buildInfo';
import { AppText } from './Text';

/**
 * The build the phone is running, in two quiet lines. Compare it with what was published to
 * confirm the latest changes have arrived.
 */
export function BuildStamp({ onDark = false }: { onDark?: boolean }) {
  const info = buildInfo();

  return (
    <View style={styles.wrapper} accessibilityLabel={`${buildLabel(info)}. ${buildDetail(info)}`}>
      <AppText variant="small" color={onDark ? 'primary' : 'textMuted'} align="center">
        {buildLabel(info)}
      </AppText>
      <AppText
        variant="small"
        color={onDark ? 'textOnPrimary' : 'textMuted'}
        align="center"
        style={onDark ? styles.dim : undefined}
      >
        {buildDetail(info)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', paddingVertical: spacing.md },
  dim: { opacity: 0.6 },
});
