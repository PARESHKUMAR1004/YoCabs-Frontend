import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, shadow, spacing } from '@/config/brand';
import { Button } from './Button';
import { useDialogs, type DialogRequest } from './dialog.store';
import { AppText } from './Text';

function emblem(request: DialogRequest): {
  icon: keyof typeof Ionicons.glyphMap;
  background: string;
  tint: string;
} {
  if (request.tone === 'error') {
    return { icon: 'alert', background: colors.dangerSoft, tint: colors.danger };
  }
  if (request.tone === 'confirm') {
    return request.destructive
      ? { icon: 'warning', background: colors.dangerSoft, tint: colors.danger }
      : { icon: 'help', background: colors.ink, tint: colors.primary };
  }
  return { icon: 'information', background: colors.primarySoft, tint: colors.primaryDark };
}

/**
 * Every notice, error and question in the app is shown here, for every role. It is mounted once
 * at the root and driven by the functions in `shared/utils/feedback`.
 */
export function DialogHost() {
  const request = useDialogs((state) => state.queue[0]);
  const answer = useDialogs((state) => state.answer);

  if (!request) return null;

  const look = emblem(request);

  return (
    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => answer(false)}
    >
      <Pressable style={styles.scrim} onPress={() => answer(false)} accessibilityLabel="Dismiss">
        {/* A press on the card itself must not fall through to the scrim. */}
        <Pressable style={styles.card} onPress={() => undefined} accessibilityRole="alert">
          <View style={styles.accent} />
          <View style={[styles.emblem, { backgroundColor: look.background }]}>
            <Ionicons name={look.icon} size={26} color={look.tint} />
          </View>

          <AppText variant="heading" align="center" style={styles.title}>
            {request.title}
          </AppText>
          {request.message ? (
            <AppText color="textMuted" align="center" style={styles.message}>
              {request.message}
            </AppText>
          ) : null}

          {request.detail ? (
            <AppText
              variant="small"
              color="textMuted"
              align="center"
              selectable
              style={styles.detail}
            >
              {request.detail}
            </AppText>
          ) : null}

          <View style={styles.actions}>
            <Button
              title={request.confirmLabel}
              variant={request.destructive ? 'danger' : 'primary'}
              onPress={() => answer(true)}
              testID="dialog-confirm"
            />
            {request.cancelLabel ? (
              <Button
                title={request.cancelLabel}
                variant="ghost"
                onPress={() => answer(false)}
                testID="dialog-cancel"
              />
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
    ...shadow.raised,
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary,
  },
  emblem: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { marginBottom: spacing.sm },
  message: { marginBottom: spacing.lg },
  detail: { marginBottom: spacing.lg, opacity: 0.8 },
  actions: { alignSelf: 'stretch', marginTop: spacing.sm },
});
