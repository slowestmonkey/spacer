import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { FONT_FAMILY, LABEL_TEXT_COLOR } from '../game/constants';

/**
 * Godot's `Label` with a `LabelSettings` resource.
 *
 * `fonts/default_label_settings.tres` sets `font_size = 8` and
 * `fonts/title_label_settings.tres` leaves it at the theme default of 16; both
 * are used inside containers scaled 3x, so callers pass the already-multiplied
 * size.
 */
export type PixelTextAlign = 'left' | 'center' | 'right';

interface PixelTextProps {
  children: React.ReactNode;
  size: number;
  align?: PixelTextAlign;
  color?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  testID?: string;
}

export function PixelText({
  children,
  size,
  align = 'left',
  color = LABEL_TEXT_COLOR,
  style,
  numberOfLines,
  testID,
}: PixelTextProps) {
  return (
    <Text
      testID={testID}
      numberOfLines={numberOfLines}
      style={[
        styles.text,
        {
          fontSize: size,
          // Kenney Mini Square is a 1:1 pixel face; a tight line box keeps the
          // vertical rhythm of the Godot labels.
          lineHeight: Math.round(size * 1.25),
          textAlign: align,
          color,
        },
        style,
      ]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: FONT_FAMILY,
    includeFontPadding: false,
  },
});
