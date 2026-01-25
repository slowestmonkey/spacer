import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

// Vibrant color palette
const COLORS = {
  textPrimary: '#ffffff',
  textSecondary: '#aaccff',
  teal: '#4a90a4',
  cyan: '#66d9ff',
  green: '#2ecc71',
  orange: '#f39c12',
  yellow: '#ffd93d',
  red: '#e74c3c',
  pink: '#ff66b2',
  purple: '#9b59b6',
};

interface PixelTextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  color?: string;
  glow?: boolean;
  glowColor?: string;
}

const FONT_SIZES = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
};

export const PixelText: React.FC<PixelTextProps> = ({
  children,
  style,
  size = 'md',
  color = COLORS.textPrimary,
  glow = false,
  glowColor,
}) => {
  const fontSize = typeof size === 'number' ? size : FONT_SIZES[size];
  const shadowColor = glowColor || color;

  return (
    <Text
      style={[
        styles.text,
        {
          fontSize,
          color,
          fontFamily: 'PressStart2P',
          // Glow effect
          textShadowColor: glow ? shadowColor : 'rgba(0, 0, 0, 0.5)',
          textShadowOffset: glow ? { width: 0, height: 0 } : { width: 1, height: 1 },
          textShadowRadius: glow ? 8 : 0,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

// Named color presets for convenience
export const PixelTextColors = COLORS;

const styles = StyleSheet.create({
  text: {
    letterSpacing: 1,
  },
});
