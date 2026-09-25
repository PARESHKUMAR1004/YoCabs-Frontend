/** Brand identity lives here so it can change without touching screens. */
export const brand = {
  name: 'YoCabs',
  tagline: 'Safar Aapka, Saathi Hum',
  supportEmail: 'support@yocabs.example',
  currency: 'INR',
  /** Booking token the tourist pays to confirm; the API is authoritative, this is only descriptive copy. */
  tokenPercentDescription: '25%',
} as const;

export const colors = {
  primary: '#F97316',
  primaryDark: '#EA580C',
  primarySoft: '#FFEDD5',
  text: '#111827',
  textMuted: '#6B7280',
  textOnPrimary: '#FFFFFF',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  border: '#E5E7EB',
  success: '#16A34A',
  successSoft: '#DCFCE7',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  info: '#2563EB',
  infoSoft: '#DBEAFE',
  overlay: 'rgba(17,24,39,0.5)',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export const typography = {
  title: { fontSize: 24, fontWeight: '700' as const },
  heading: { fontSize: 18, fontWeight: '700' as const },
  subheading: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small: { fontSize: 12, fontWeight: '400' as const },
} as const;
