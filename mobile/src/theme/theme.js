// Central design tokens for the "glass" UI look used across the app.

export const colors = {
  gradientStart: '#0B3D91', // deep blue
  gradientEnd: '#1E88E5',   // lighter blue
  accent: '#FF7A00',        // flame orange (matches app icon)
  glassFill: 'rgba(8,30,80,0.38)',
  glassBorder: 'rgba(255,255,255,0.35)',
  textShadow: 'rgba(0,0,0,0.45)',
  textLight: '#FFFFFF',
  textDark: '#0B1B33',
  textMuted: 'rgba(255,255,255,0.75)',
  success: '#2ECC71',
  danger: '#E74C3C',
  warning: '#F5A623',
};

export const radius = {
  card: 22,
  button: 16,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
};

const shadow = {
  textShadowColor: colors.textShadow,
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', color: colors.textLight, ...shadow },
  h2: { fontSize: 20, fontWeight: '600', color: colors.textLight, ...shadow },
  body: { fontSize: 15, color: colors.textLight, ...shadow },
  caption: { fontSize: 13, color: colors.textMuted, ...shadow },
};
