// src/lib/theme.ts

export const COLORS = {
  // Main backgrounds
  background: "#09090B",
  backgroundSoft: "#0F0F12",
  surface: "#141417",
  surfaceElevated: "#1A1A1F",
  surfaceLight: "#202025",

  // Borders
  border: "#27272A",
  borderLight: "#303036",

  // Text
  white: "#FFFFFF",
  text: "#F4F4F5",
  textSecondary: "#A1A1AA",
  textMuted: "#71717A",
  textDim: "#52525B",

  // Accent
  accent: "#F5B942",
  accentSoft: "#2A2110",
  accentDark: "#C58A16",

  // Ratings
  rating: "#F5B942",

  // Status
  success: "#4ADE80",
  danger: "#F87171",
  warning: "#FBBF24",
};


export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};


export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 26,
  round: 999,
};


export const TYPOGRAPHY = {
  // Large screen titles
  display: {
    fontSize: 34,
    fontWeight: "800" as const,
    letterSpacing: -1,
  },

  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    letterSpacing: -0.6,
  },

  heading: {
    fontSize: 21,
    fontWeight: "800" as const,
    letterSpacing: -0.3,
  },

  subheading: {
    fontSize: 17,
    fontWeight: "700" as const,
  },

  body: {
    fontSize: 15,
    fontWeight: "500" as const,
    lineHeight: 22,
  },

  bodyBold: {
    fontSize: 15,
    fontWeight: "700" as const,
  },

  small: {
    fontSize: 13,
    fontWeight: "500" as const,
  },

  smallBold: {
    fontSize: 13,
    fontWeight: "700" as const,
  },

  caption: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
  },
};


export const SHADOWS = {
  card: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },

  floating: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
};


export const COMMON = {
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  elevatedCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800" as const,
    letterSpacing: 1.5,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
};