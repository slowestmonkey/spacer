import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ExplosionEffect } from '../components/ExplosionEffect';
import { PixelText } from '../components/PixelText';
import { Ship } from '../components/Ship';
import { getShipDestroyPosition } from '../components/shipGeometry';
import { SpaceBackground } from '../components/SpaceBackground';
import {
  SETTINGS_FILE_PATH,
  SHIP_DATA_SECTION,
  SHIP_HULL_KEY,
} from '../game/constants';
import { useScene } from '../game/SceneContext';
import { GameCanvas, Scene, UiLayer } from '../game/Stage';
import { findFailedGoalDays } from '../models/goalValidation';
import { goalResource, stepResource } from '../resources';
import { ConfigFile, OK } from '../storage/ConfigFile';
import { getStartOfTodayUnix } from '../time/godotTime';

/** `world.tscn -> FuelUpdateTimer.wait_time = 2.0` */
const FUEL_UPDATE_INTERVAL_MS = 2000;

/** `await get_tree().create_timer(1.0).timeout` in `_ready()` and `on_ship_exit()`. */
const STARTUP_DELAY_MS = 1000;
const GAME_OVER_DELAY_MS = 1000;

/**
 * `world.tscn` label rects — the parent is a `Node2D`, so these are plain
 * offsets on the design surface. Written as style objects so they can be
 * applied directly; React Native has no `x`/`y` style keys and would silently
 * drop them, stacking both labels in the corner.
 */
const FUEL_LABEL_RECT = { left: 17, top: 62, width: 176, height: 33 };
const GOAL_LABEL_RECT = { left: 206, top: 62, width: 176, height: 33 };
const LABEL_FONT_SIZE = 26;

/** Port of `world.tscn` + `world.gd`. */
export function WorldScreen() {
  const { changeScene } = useScene();

  const [shipHull, setShipHull] = useState<number | null>(null);
  const [shipAlive, setShipAlive] = useState(true);
  const [explosion, setExplosion] = useState<{ x: number; y: number } | null>(null);
  const [fuelText, setFuelText] = useState('Fuel: loading');
  const [goalText, setGoalText] = useState('Goal: loading');

  const destroyed = useRef(false);
  const cancelled = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const track = useCallback((timer: ReturnType<typeof setTimeout>) => {
    timers.current.push(timer);
    return timer;
  }, []);

  /** `world.gd -> save_ship_hull()` — a null hull sends the next launch to the start menu. */
  const saveShipHull = useCallback(async (hullValue: number | null) => {
    const config = new ConfigFile();
    await config.load(SETTINGS_FILE_PATH);
    config.setValue(SHIP_DATA_SECTION, SHIP_HULL_KEY, hullValue);
    if ((await config.save(SETTINGS_FILE_PATH)) !== OK) {
      console.log('Failed to save config file');
    }
  }, []);

  /**
   * `world.gd -> destroy_ship()` plus the `tree_exiting` handler it triggers.
   *
   * `validate_goal()` calls this once per missed day; the ship can only blow up
   * once, so the guard collapses the repeats.
   */
  const destroyShip = useCallback(() => {
    if (destroyed.current) {
      return;
    }
    destroyed.current = true;

    setShipAlive(false);
    setExplosion(getShipDestroyPosition());
    void saveShipHull(null);

    track(
      setTimeout(() => {
        if (!cancelled.current) {
          changeScene('game_over');
        }
      }, GAME_OVER_DELAY_MS),
    );
  }, [changeScene, saveShipHull, track]);

  /** `world.gd -> update_fuel_display()` */
  const updateFuelDisplay = useCallback(async () => {
    const steps = await stepResource.fetchTodaySteps();
    if (!cancelled.current) {
      setFuelText(`Fuel: ${Math.trunc(steps / 10)}`);
    }
  }, []);

  /** `world.gd -> update_goal_display()` */
  const updateGoalDisplay = useCallback(() => {
    setGoalText(`Goal: ${Math.trunc(goalResource.goal / 10)}`);
  }, []);

  useEffect(() => {
    cancelled.current = false;
    let fuelTimer: ReturnType<typeof setInterval> | undefined;

    const ready = async () => {
      // initialize_resources()
      await goalResource.init();
      await stepResource.init(goalResource.goalPeriodDays);

      // load_settings()
      const config = new ConfigFile();
      const loadedOk = (await config.load(SETTINGS_FILE_PATH)) === OK;
      if (!loadedOk) {
        console.log('Could not load config file');
      }
      const hull = loadedOk ? config.getValue(SHIP_DATA_SECTION, SHIP_HULL_KEY) : null;
      if (cancelled.current) {
        return;
      }

      // is_ship_hull_missing() -> navigate_to_start_menu()
      if (typeof hull !== 'number') {
        changeScene('start_menu');
        return;
      }
      setShipHull(hull);

      // initialize_game() -> setup_ui()
      await updateFuelDisplay();
      updateGoalDisplay();
      fuelTimer = setInterval(() => void updateFuelDisplay(), FUEL_UPDATE_INTERVAL_MS);

      // load_goal_settings()
      await goalResource.loadGoalSettings();

      await new Promise<void>((resolve) => {
        track(setTimeout(resolve, STARTUP_DELAY_MS));
      });
      if (cancelled.current) {
        return;
      }

      // refresh_goal()
      if (goalResource.shouldUpdateGoal()) {
        const stepsData = await stepResource.fetchStepsForPeriod();
        await goalResource.updateGoal(stepsData);
        if (cancelled.current) {
          return;
        }
      }

      // validate_goal()
      const stepsData = await stepResource.fetchStepsForPeriod();
      if (cancelled.current) {
        return;
      }
      const failedDays = findFailedGoalDays({
        stepsData,
        goal: goalResource.goal,
        goalSetAt: goalResource.goalSetAt,
        todayTime: getStartOfTodayUnix(),
      });
      if (failedDays.length > 0) {
        destroyShip();
      }
    };

    void ready();

    return () => {
      cancelled.current = true;
      if (fuelTimer) {
        clearInterval(fuelTimer);
      }
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [changeScene, destroyShip, track, updateFuelDisplay, updateGoalDisplay]);

  return (
    <Scene>
      <GameCanvas>
        <SpaceBackground exponent={1} />
        {shipAlive && shipHull !== null ? <Ship shipHull={shipHull} /> : null}
        {explosion ? (
          <ExplosionEffect
            x={explosion.x}
            y={explosion.y}
            onFinished={() => setExplosion(null)}
          />
        ) : null}
      </GameCanvas>

      <UiLayer>
        {/* `fuel_label.mouse_filter = MOUSE_FILTER_STOP` — tapping it scuttles the ship. */}
        <Pressable
          testID="fuel-label"
          onPress={destroyShip}
          style={[styles.label, FUEL_LABEL_RECT]}>
          <PixelText size={LABEL_FONT_SIZE} align="center">
            {fuelText}
          </PixelText>
        </Pressable>

        <View
          testID="goal-label-container"
          style={[styles.label, GOAL_LABEL_RECT]}
          pointerEvents="none">
          <PixelText size={LABEL_FONT_SIZE} align="center" testID="goal-label">
            {goalText}
          </PixelText>
        </View>
      </UiLayer>
    </Scene>
  );
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
