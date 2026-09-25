import { colors } from '@/config/brand';

/** Shared header look for every stack navigator. */
export const stackScreenOptions = {
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' as const },
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

export const tabScreenOptions = {
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarStyle: { borderTopColor: colors.border },
};
