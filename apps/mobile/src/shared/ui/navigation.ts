import { colors, fonts } from '@/config/brand';

const headerTitleStyle = {
  fontFamily: fonts.displaySemi,
  fontSize: 20,
  color: colors.text,
} as const;

/** Shared header look for every stack navigator. */
export const stackScreenOptions = {
  headerTintColor: colors.text,
  headerTitleStyle,
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

export const tabScreenOptions = {
  headerTitleStyle,
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  sceneStyle: { backgroundColor: colors.background },
  tabBarActiveTintColor: colors.primaryDark,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
  tabBarStyle: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    height: 64,
    paddingTop: 6,
  },
};
