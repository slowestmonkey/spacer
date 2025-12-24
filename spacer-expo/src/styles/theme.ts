import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

// Colors - dark space theme with accent colors
export const colors = {
  bg: '#0a0a0f',
  bgLight: '#12121a',
  primary: '#00ff88',
  secondary: '#00aaff',
  danger: '#ff4444',
  warning: '#ffaa00',
  text: '#ffffff',
  textDim: '#667788',
  textMuted: '#445566',
  border: '#334455',
  borderLight: '#556677',
};

// Shared text styles with pixel font
export const text = {
  pixel: {
    fontFamily: 'pixel',
  } as TextStyle,

  title: {
    fontFamily: 'pixel',
    fontSize: 32,
    color: colors.text,
    letterSpacing: 4,
  } as TextStyle,

  titleLarge: {
    fontFamily: 'pixel',
    fontSize: 48,
    color: colors.text,
    letterSpacing: 6,
  } as TextStyle,

  subtitle: {
    fontFamily: 'pixel',
    fontSize: 12,
    color: colors.textDim,
    letterSpacing: 1,
  } as TextStyle,

  label: {
    fontFamily: 'pixel',
    fontSize: 10,
    color: colors.textDim,
    letterSpacing: 2,
    textTransform: 'uppercase',
  } as TextStyle,

  value: {
    fontFamily: 'pixel',
    fontSize: 24,
    color: colors.text,
  } as TextStyle,

  valueLarge: {
    fontFamily: 'pixel',
    fontSize: 32,
    color: colors.text,
  } as TextStyle,

  button: {
    fontFamily: 'pixel',
    fontSize: 14,
    color: colors.text,
    letterSpacing: 3,
  } as TextStyle,
};

// Pixelated box shadow effect using borders
export const pixelBorder = (color: string = colors.border, width: number = 2): ViewStyle => ({
  borderWidth: width,
  borderColor: color,
  borderStyle: 'solid',
});

// Shared component styles
export const components = StyleSheet.create({
  // Main button style - pixelated look
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: colors.bgLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  buttonSecondary: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border,
  },

  buttonDanger: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: colors.bgLight,
    borderWidth: 2,
    borderColor: colors.danger,
  },

  // Container with pixel border
  panel: {
    backgroundColor: colors.bgLight,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
  },

  // HUD-style container
  hudBox: {
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // Indicator dot (for pagination, etc)
  dot: {
    width: 8,
    height: 8,
    backgroundColor: colors.border,
  },

  dotActive: {
    width: 8,
    height: 8,
    backgroundColor: colors.primary,
  },
});

// Screen container style
export const screenContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.bg,
  alignItems: 'center',
  justifyContent: 'center',
};
