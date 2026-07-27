import { StyleSheet, TextInput } from 'react-native';

import { FONT_FAMILY, TEXT_COLOR, UI_SCALE } from '../game/constants';
import {
  CONTENT_MARGIN,
  CORNER_RADIUS,
  FOCUS_BORDER_WIDTH,
  STYLE_FOCUS_COLOR,
  STYLE_NORMAL_COLOR,
} from './theme';

/**
 * `hangar.tscn -> UsernameLineEdit`: a default-themed `LineEdit` with the font
 * overridden to `kenney_mini_square.ttf` at the theme default size of 16, drawn
 * inside the 3x-scaled container.
 */
export function PixelTextInput({
  value,
  onChangeText,
  testID,
}: {
  value: string;
  onChangeText: (text: string) => void;
  testID?: string;
}) {
  return (
    <TextInput
      testID={testID}
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
      selectionColor={TEXT_COLOR}
      cursorColor={TEXT_COLOR}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="done"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 30 * UI_SCALE,
    fontFamily: FONT_FAMILY,
    fontSize: 16 * UI_SCALE,
    color: TEXT_COLOR,
    backgroundColor: STYLE_NORMAL_COLOR,
    borderRadius: CORNER_RADIUS,
    borderWidth: FOCUS_BORDER_WIDTH,
    borderColor: STYLE_FOCUS_COLOR,
    paddingHorizontal: CONTENT_MARGIN,
    paddingVertical: 0,
  },
});
