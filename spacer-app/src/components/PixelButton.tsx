import { Pressable, StyleSheet, View } from 'react-native';

import { TEXT_COLOR, UI_SCALE } from '../game/constants';
import { PixelText } from './PixelText';
import {
  ACCENT_COLOR,
  CONTENT_MARGIN,
  CORNER_RADIUS,
  FOCUS_BORDER_WIDTH,
  STYLE_NORMAL_COLOR,
  STYLE_PRESSED_COLOR,
} from './theme';

/**
 * Godot's default-themed `Button` — `hangar.tscn -> StartButton`, which
 * overrides the font to `kenney_mini_square.ttf` at the theme's default size of
 * 16 and is drawn inside the 3x-scaled container.
 */
export function PixelButton({
  label,
  onPress,
  testID,
}: {
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable testID={testID} onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <View style={[styles.button, pressed && styles.pressed]}>
          {/* A `Button` reads its font colour from the theme, not from LabelSettings. */}
          <PixelText size={16 * UI_SCALE} align="center" color={TEXT_COLOR}>
            {label}
          </PixelText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: STYLE_NORMAL_COLOR,
    borderRadius: CORNER_RADIUS,
    borderWidth: FOCUS_BORDER_WIDTH,
    borderColor: ACCENT_COLOR,
    paddingVertical: CONTENT_MARGIN,
    paddingHorizontal: CONTENT_MARGIN * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: STYLE_PRESSED_COLOR,
  },
});
