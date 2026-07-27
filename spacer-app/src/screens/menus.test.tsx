import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render } from '@testing-library/react-native';

import { SETTINGS_FILE_PATH } from '../game/constants';
import { registerHealthKitProvider } from '../health/healthKit';
import { goalResource, stepResource } from '../resources';
import { ConfigFile } from '../storage/ConfigFile';
import { Harness } from '../testing/harness';
import { GameOverScreen } from './GameOverScreen';
import { HangarScreen } from './HangarScreen';
import { SHIP_STRIDE } from './hangarLayout';
import { StartMenuScreen } from './StartMenuScreen';

/** Lets a screen's `_ready()` promise chain run to completion. */
async function settle() {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(100);
  });
}

beforeEach(async () => {
  jest.useFakeTimers();
  await AsyncStorage.clear();
  registerHealthKitProvider(null);
  goalResource.goal = 0;
  goalResource.goalSetAt = '';
  (stepResource as unknown as { healthKit: unknown }).healthKit = null;
});

afterEach(() => {
  jest.useRealTimers();
});

describe('StartMenuScreen', () => {
  it('shows the title and the prompt', async () => {
    const view = await render(
      <Harness initialScene="start_menu">
        <StartMenuScreen />
      </Harness>,
    );
    await settle();

    expect(view.getByText('Spacer')).toBeOnTheScreen();
    expect(view.getByText('Tap to start')).toBeOnTheScreen();
  });

  it('moves on to the hangar when tapped', async () => {
    const view = await render(
      <Harness initialScene="start_menu">
        <StartMenuScreen />
      </Harness>,
    );
    await settle();

    await fireEvent.press(view.getByTestId('start-menu'));

    expect(view.getByTestId('current-scene')).toHaveTextContent('hangar');
  });
});

describe('HangarScreen', () => {
  it('preselects the stored ship rather than the one after it', async () => {
    const config = new ConfigFile();
    config.setValue('ship_data', 'ship_hull', 4);
    config.setValue('ship_data', 'username', 'monkey');
    await config.save(SETTINGS_FILE_PATH);

    const view = await render(
      <Harness initialScene="hangar">
        <HangarScreen />
      </Harness>,
    );
    await settle();

    expect(view.getByTestId('username-input').props.value).toBe('monkey');
    // Hull 4 is index 3, so the carousel opens three ships in.
    expect(view.getByTestId('ship-carousel').props.contentOffset).toEqual({
      x: 3 * SHIP_STRIDE,
      y: 0,
    });
  });

  it('starts at the first ship on a fresh install', async () => {
    const view = await render(
      <Harness initialScene="hangar">
        <HangarScreen />
      </Harness>,
    );
    await settle();

    expect(view.getByTestId('username-input').props.value).toBe('');
    expect(view.getByTestId('ship-carousel').props.contentOffset).toEqual({ x: 0, y: 0 });
  });

  it('saves the hull, username and journey date, then launches the world', async () => {
    const view = await render(
      <Harness initialScene="hangar">
        <HangarScreen />
      </Harness>,
    );
    await settle();

    await fireEvent.changeText(view.getByTestId('username-input'), 'monkey');
    await settle();

    await fireEvent.press(view.getByTestId('start-button'));
    await settle();

    expect(view.getByTestId('current-scene')).toHaveTextContent('world');

    const config = new ConfigFile();
    await config.load(SETTINGS_FILE_PATH);
    // save_selection() stores selected_index + 1.
    expect(config.getValue('ship_data', 'ship_hull', 0)).toBe(1);
    expect(config.getValue('ship_data', 'username', '')).toBe('monkey');
    expect(config.getValue('ship_data', 'journey_started_at', '')).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
    );
  });

  it('computes the goal from the period steps before launching', async () => {
    registerHealthKitProvider({
      runTodayStepsQuery: () => {},
      runPeriodStepsQuery: () => {},
      getTodaySteps: () => 100,
      getPeriodStepsDict: () => ({ '2025-07-01': 9000, '2025-07-02': 9000 }),
    });

    const view = await render(
      <Harness initialScene="hangar">
        <HangarScreen />
      </Harness>,
    );
    await settle();

    await fireEvent.press(view.getByTestId('start-button'));
    await settle();

    expect(view.getByTestId('current-scene')).toHaveTextContent('world');

    const config = new ConfigFile();
    await config.load(SETTINGS_FILE_PATH);
    // 18000 / 30 * level, truncated.
    expect(config.getValue('goal_data', 'goal', -1)).toBe(
      Math.trunc((18000 / goalResource.goalPeriodDays) * goalResource.level),
    );
    expect(config.getValue('goal_data', 'goal_set_at', '')).not.toBe('');
  });
});

describe('GameOverScreen', () => {
  it('reports the journey that just ended', async () => {
    const config = new ConfigFile();
    config.setValue('ship_data', 'username', 'monkey');
    config.setValue('ship_data', 'journey_started_at', '2025-04-08T21:15:00');
    config.setValue('goal_data', 'goal', 11173);
    await config.save(SETTINGS_FILE_PATH);

    const view = await render(
      <Harness initialScene="game_over">
        <GameOverScreen />
      </Harness>,
    );
    await settle();

    expect(view.getByTestId('game-over-username')).toHaveTextContent('monkey');
    expect(view.getByTestId('game-over-goal')).toHaveTextContent('11173');
    expect(view.getByTestId('game-over-journey')).toHaveTextContent('2025-04-08');
  });

  it('renders without a journey date when nothing was ever saved', async () => {
    const config = new ConfigFile();
    config.setValue('ship_data', 'username', '');
    await config.save(SETTINGS_FILE_PATH);

    const view = await render(
      <Harness initialScene="game_over">
        <GameOverScreen />
      </Harness>,
    );
    await settle();

    expect(view.getByTestId('game-over-journey')).toHaveTextContent('');
    expect(view.getByTestId('game-over-goal')).toHaveTextContent('0');
  });

  it('returns to the hangar when tapped', async () => {
    const view = await render(
      <Harness initialScene="game_over">
        <GameOverScreen />
      </Harness>,
    );
    await settle();

    await fireEvent.press(view.getByTestId('game-over'));

    expect(view.getByTestId('current-scene')).toHaveTextContent('hangar');
  });
});
