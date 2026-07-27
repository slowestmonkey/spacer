import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { PixelButton } from '../components/PixelButton';
import { PixelText } from '../components/PixelText';
import { PixelTextInput } from '../components/PixelTextInput';
import { ShipCarouselScroller, ShipCarouselSprites } from '../components/ShipCarousel';
import { SpaceBackground } from '../components/SpaceBackground';
import {
  JOURNEY_STARTED_AT_KEY,
  SETTINGS_FILE_PATH,
  SHIP_DATA_SECTION,
  SHIP_HULL_KEY,
  TOTAL_SHIPS,
  UI_SCALE,
  USERNAME_KEY,
} from '../game/constants';
import { useScene } from '../game/SceneContext';
import { GameCanvas, Scene, UiLayer } from '../game/Stage';
import { goalResource, stepResource } from '../resources';
import { ConfigFile, OK } from '../storage/ConfigFile';
import { getDatetimeStringFromSystem } from '../time/godotTime';
import {
  SHIP_STRIDE,
  START_BUTTON_RECT,
  USERNAME_INPUT_RECT,
  USERNAME_LABEL_RECT,
  selectedIndexForScroll,
  shipHullToIndex,
} from './hangarLayout';

/** Port of `menus/hangar.tscn` + `menus/hangar.gd`. */
export function HangarScreen() {
  const { changeScene } = useScene();
  const [loaded, setLoaded] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const [username, setUsername] = useState('');
  const selectedIndex = useRef(0);
  const scrollX = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;

    const ready = async () => {
      await stepResource.init(goalResource.goalPeriodDays);

      const config = new ConfigFile();
      const loadedOk = (await config.load(SETTINGS_FILE_PATH)) === OK;
      if (cancelled) {
        return;
      }

      const index = loadedOk
        ? shipHullToIndex(config.getValue(SHIP_DATA_SECTION, SHIP_HULL_KEY, 0))
        : 0;

      selectedIndex.current = index;
      scrollX.value = index * SHIP_STRIDE;
      setInitialIndex(index);
      setUsername(loadedOk ? String(config.getValue(SHIP_DATA_SECTION, USERNAME_KEY, '')) : '');
      setLoaded(true);
    };

    void ready();

    return () => {
      cancelled = true;
    };
  }, [scrollX]);

  /** `hangar.gd -> save_selection()` + `save_username()` + `save_journey_started_at()`. */
  const saveSelection = async () => {
    const config = new ConfigFile();
    if ((await config.load(SETTINGS_FILE_PATH)) !== OK) {
      await config.save(SETTINGS_FILE_PATH);
    }
    config.setValue(SHIP_DATA_SECTION, SHIP_HULL_KEY, selectedIndex.current + 1);
    config.setValue(SHIP_DATA_SECTION, USERNAME_KEY, username);
    config.setValue(SHIP_DATA_SECTION, JOURNEY_STARTED_AT_KEY, getDatetimeStringFromSystem());
    await config.save(SETTINGS_FILE_PATH);
  };

  const onStartPressed = async () => {
    await saveSelection();
    const stepsData = await stepResource.fetchStepsForPeriod();
    await goalResource.updateGoal(stepsData);
    changeScene('world');
  };

  return (
    <Scene>
      <GameCanvas>
        {/* `hangar.tscn` instances the background with `exponent = 0` — the stars hold still. */}
        <SpaceBackground exponent={0} />
        <ShipCarouselSprites scrollX={scrollX} />
      </GameCanvas>

      <UiLayer>
        <View
          style={[
            styles.absolute,
            {
              left: USERNAME_LABEL_RECT.x,
              top: USERNAME_LABEL_RECT.y,
              width: USERNAME_LABEL_RECT.width,
            },
          ]}>
          <PixelText size={8 * UI_SCALE}>Enter your username:</PixelText>
        </View>

        <View
          style={[
            styles.absolute,
            {
              left: USERNAME_INPUT_RECT.x,
              top: USERNAME_INPUT_RECT.y,
              width: USERNAME_INPUT_RECT.width,
            },
          ]}>
          <PixelTextInput testID="username-input" value={username} onChangeText={setUsername} />
        </View>

        {loaded ? (
          <ShipCarouselScroller
            scrollX={scrollX}
            initialIndex={initialIndex}
            onSelect={(offset) => {
              selectedIndex.current = selectedIndexForScroll(offset);
            }}
          />
        ) : null}

        <View
          style={[
            styles.absolute,
            {
              left: START_BUTTON_RECT.x,
              top: START_BUTTON_RECT.y,
              width: START_BUTTON_RECT.width,
            },
          ]}>
          <PixelButton testID="start-button" label="Start" onPress={() => void onStartPressed()} />
        </View>
      </UiLayer>
    </Scene>
  );
}

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
  },
});
