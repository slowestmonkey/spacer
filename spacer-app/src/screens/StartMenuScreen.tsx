import { Pressable, StyleSheet, View } from 'react-native';

import { PixelText } from '../components/PixelText';
import { SpaceBackground } from '../components/SpaceBackground';
import { UI_SCALE } from '../game/constants';
import { useScene } from '../game/SceneContext';
import { GameCanvas, Scene, UiLayer } from '../game/Stage';

/**
 * Port of `menus/start_menu.tscn` + `menus/start_menu.gd`.
 *
 * A centred title over the scrolling background; any touch moves on to the
 * hangar.
 */
export function StartMenuScreen() {
  const { changeScene } = useScene();

  return (
    <Scene>
      <GameCanvas>
        <SpaceBackground exponent={1} />
      </GameCanvas>

      <UiLayer>
        <Pressable
          testID="start-menu"
          style={styles.fill}
          onPress={() => changeScene('hangar')}>
          <View style={styles.centre}>
            {/* title_label_settings.tres — theme default font size of 16, 3x container scale */}
            <PixelText size={16 * UI_SCALE} align="center">
              Spacer
            </PixelText>
            {/* default_label_settings.tres — font_size = 8 */}
            <PixelText size={8 * UI_SCALE} align="center">
              Tap to start
            </PixelText>
          </View>
        </Pressable>
      </UiLayer>
    </Scene>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // VBoxContainer default separation of 4, at the container's 3x scale.
    gap: 4 * UI_SCALE,
  },
});
