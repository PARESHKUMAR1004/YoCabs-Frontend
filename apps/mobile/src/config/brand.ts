/** Brand identity lives here so it can change without touching screens. */
export const brand = {
  name: 'YoCabs',
  tagline: 'Safar Aapka, Saathi Hum',
  supportEmail: 'support@yocabs.example',
  currency: 'INR',
  /** Booking token the tourist pays to confirm; the API is authoritative, this is only descriptive copy. */
  tokenPercentDescription: '25%',
} as const;

/**
 * Midnight and champagne: a deep ink for weight, warm ivory for the ground, and a restrained gold
 * accent. Screens name a role (`primary`, `surface`), never a hex value.
 */
export const colors = {
  ink: '#0B1220',
  inkSoft: '#1C2540',
  primary: '#B08D57',
  primaryDark: '#8A6A34',
  primarySoft: '#F3EBDA',
  text: '#0B1220',
  textMuted: '#6B6559',
  textOnPrimary: '#FFFFFF',
  background: '#FBFAF7',
  card: '#FFFFFF',
  surface: '#F4F1EA',
  border: '#E7E1D3',
  success: '#2E7D5B',
  successSoft: '#E1F2E9',
  danger: '#B3423A',
  dangerSoft: '#F9E3E1',
  warning: '#A8741A',
  warningSoft: '#F8EBD0',
  info: '#38598B',
  infoSoft: '#E1E9F5',
  overlay: 'rgba(11,18,32,0.55)',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

/** Font family names as registered in the root layout (one family per weight on Android). */
export const fonts = {
  display: 'PlayfairDisplay_700Bold',
  displaySemi: 'PlayfairDisplay_600SemiBold',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 35, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.displaySemi, fontSize: 20, lineHeight: 27 },
  subheading: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0.2 },
  small: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
} as const;

/** Soft, warm shadows: depth without harshness. */
export const shadow = {
  card: {
    shadowColor: '#1B1407',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#1B1407',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;
