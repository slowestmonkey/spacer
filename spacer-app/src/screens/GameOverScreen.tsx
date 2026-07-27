import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PixelText } from '../components/PixelText';
import { SpaceBackground } from '../components/SpaceBackground';
import {
  DESIGN_WIDTH,
  GOAL_DATA_SECTION,
  GOAL_KEY,
  JOURNEY_STARTED_AT_KEY,
  SETTINGS_FILE_PATH,
  SHIP_DATA_SECTION,
  UI_SCALE,
  USERNAME_KEY,
} from '../game/constants';
import { useScene } from '../game/SceneContext';
import { GameCanvas, Scene, UiLayer } from '../game/Stage';
import { ConfigFile, OK } from '../storage/ConfigFile';
import { formatDateFromDatetimeString } from '../time/godotTime';

/** Port of `menus/game_over.tscn` + `menus/game_over.gd`. */
export function GameOverScreen() {
  const { changeScene } = useScene();
  const [username, setUsername] = useState('');
  const [goal, setGoal] = useState('0');
  const [journeyDate, setJourneyDate] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      const config = new ConfigFile();
      const err = await config.load(SETTINGS_FILE_PATH);

      if (err !== OK) {
        console.log(`Could not load config file. Error code: ${err}`);
        return;
      }
      if (cancelled) {
        return;
      }

      setGoal(String(config.getValue(GOAL_DATA_SECTION, GOAL_KEY, 0)));
      setJourneyDate(
        formatDateFromDatetimeString(
          String(config.getValue(SHIP_DATA_SECTION, JOURNEY_STARTED_AT_KEY, '')),
        ),
      );
      setUsername(String(config.getValue(SHIP_DATA_SECTION, USERNAME_KEY, '')));
    };

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Scene>
      <GameCanvas>
        <SpaceBackground exponent={1} />
      </GameCanvas>

      <UiLayer>
        <Pressable
          testID="game-over"
          style={styles.fill}
          onPress={() => changeScene('hangar')}>
          <View style={styles.centre}>
            <View style={styles.column}>
              <PixelText size={16 * UI_SCALE} align="center">
                Game Over
              </PixelText>

              <Row label="Username:" value={username} testID="game-over-username" />
              <Row label="Goal:" value={goal} testID="game-over-goal" />
              <Row label="Journey started:" value={journeyDate} testID="game-over-journey" />

              {/* `Space` Control, custom_minimum_size = (0, 32) */}
              <View style={styles.spacer} />

              <View style={styles.menuLabel}>
                <PixelText size={8 * UI_SCALE} align="center">
                  Tap to return to the Hangar
                </PixelText>
              </View>
            </View>
          </View>
        </Pressable>
      </UiLayer>
    </Scene>
  );
}

/**
 * One `HBoxContainer` row: the caption has `size_flags_horizontal = 3`
 * (expand + fill) so the value is pushed to the right edge.
 */
function Row({ label, value, testID }: { label: string; value: string; testID?: string }) {
  return (
    <View style={styles.row}>
      <PixelText size={8 * UI_SCALE}>{label}</PixelText>
      <PixelText size={8 * UI_SCALE} align="right" testID={testID}>
        {value}
      </PixelText>
    </View>
  );
}

/**
 * The `VBoxContainer` shrink-wraps its widest row, so the block grows with a
 * long username instead of wrapping it. The floor is the "Journey started:" row
 * (71 + 4 separation + a 48-wide `YYYY-MM-DD` date = 123 at font size 8).
 */
const MIN_COLUMN_WIDTH = 123 * UI_SCALE;

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    minWidth: MIN_COLUMN_WIDTH,
    maxWidth: DESIGN_WIDTH,
    alignSelf: 'center',
    gap: 4 * UI_SCALE,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4 * UI_SCALE,
  },
  spacer: {
    height: 32 * UI_SCALE,
  },
  menuLabel: {
    minHeight: 20 * UI_SCALE,
  },
});
