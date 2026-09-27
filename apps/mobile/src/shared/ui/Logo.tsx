import { Image, StyleSheet, View } from 'react-native';
import { colors, fonts, spacing } from '@/config/brand';
import MARK_ON_DARK from '../../../assets/logo-mark.png';
import MARK_ON_LIGHT from '../../../assets/logo-mark-dark.png';
import { AppText } from './Text';

/** The YoCabs mark and name. `onDark` picks the gold mark for dark surfaces, ink for light ones. */
export function Logo({
  size = 38,
  onDark = true,
  wordmark = true,
}: {
  size?: number;
  onDark?: boolean;
  wordmark?: boolean;
}) {
  return (
    <View style={styles.row} accessibilityRole="image" accessibilityLabel="YoCabs">
      <Image
        source={onDark ? MARK_ON_DARK : MARK_ON_LIGHT}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      {wordmark ? (
        <AppText style={[styles.word, { fontSize: size * 0.6, lineHeight: size * 0.8 }]}>
          <AppText
            style={[styles.word, styles.gold, { fontSize: size * 0.6, lineHeight: size * 0.8 }]}
          >
            Yo
          </AppText>
          <AppText
            style={[
              styles.word,
              { color: onDark ? colors.textOnPrimary : colors.ink },
              { fontSize: size * 0.6, lineHeight: size * 0.8 },
            ]}
          >
            Cabs
          </AppText>
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  word: { fontFamily: fonts.display, letterSpacing: 0.5 },
  gold: { color: colors.primary },
});
