import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from '@/config/brand';
import { AppText } from './Text';

export interface SheetChoice<T extends string> {
  value: T;
  label: string;
  hint?: string;
  icon: keyof typeof Ionicons.glyphMap;
}

/** A bottom sheet offering a few large choices, in the same style as the app's dialogs. */
export function ChoiceSheet<T extends string>({
  visible,
  title,
  choices,
  onChoose,
  onClose,
}: {
  visible: boolean;
  title: string;
  choices: SheetChoice<T>[];
  onChoose: (value: T) => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close">
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.handle} />
            <AppText variant="heading" style={styles.title}>
              {title}
            </AppText>

            {choices.map((choice) => (
              <Pressable
                key={choice.value}
                accessibilityRole="button"
                onPress={() => onChoose(choice.value)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <View style={styles.icon}>
                  <Ionicons name={choice.icon} size={22} color={colors.primary} />
                </View>
                <View style={styles.text}>
                  <AppText variant="subheading">{choice.label}</AppText>
                  {choice.hint ? (
                    <AppText variant="small" color="textMuted">
                      {choice.hint}
                    </AppText>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            ))}

            <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
              <AppText variant="subheading" color="primaryDark">
                Cancel
              </AppText>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    ...shadow.raised,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  title: { marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  cancel: { alignItems: 'center', paddingVertical: spacing.lg },
});
