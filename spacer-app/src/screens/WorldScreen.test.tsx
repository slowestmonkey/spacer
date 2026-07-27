import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { SETTINGS_FILE_PATH } from '../game/constants';
import { registerHealthKitProvider } from '../health/healthKit';
import { goalResource, stepResource } from '../resources';
import { ConfigFile } from '../storage/ConfigFile';
import { Harness } from '../testing/harness';
import { getDateStringFromSystem, getDatetimeStringFromSystem } from '../time/godotTime';
import { WorldScreen } from './WorldScreen';

/** Fixed step data, so the fuel readout and goal validation are deterministic. */
function useFixedSteps(todaySteps: number, periodSteps: Record<string, number>) {
  registerHealthKitProvider({
    runTodayStepsQuery: () => {},
    runPeriodStepsQuery: () => {},
    getTodaySteps: () => todaySteps,
    getPeriodStepsDict: () => periodSteps,
  });
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function seedSettings(values: {
  shipHull?: number;
  goal?: number;
  goalSetAt?: string;
}) {
  const config = new ConfigFile();
  if (values.shipHull !== undefined) {
    config.setValue('ship_data', 'ship_hull', values.shipHull);
  }
  if (values.goal !== undefined) {
    config.setValue('goal_data', 'goal', values.goal);
  }
  if (values.goalSetAt !== undefined) {
    config.setValue('goal_data', 'goal_set_at', values.goalSetAt);
  }
  await config.save(SETTINGS_FILE_PATH);
}

async function renderWorld() {
  return render(
    <Harness>
      <WorldScreen />
    </Harness>,
  );
}

/** Runs `_ready()` through its 1s startup wait. */
async function runStartupSequence() {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(1200);
  });
}

beforeEach(async () => {
  jest.useFakeTimers();
  await AsyncStorage.clear();
  registerHealthKitProvider(null);

  // `goal.tres` and `step.tres` are shared resources that outlive a scene, so
  // reset the singletons the way a fresh process would start.
  goalResource.goal = 0;
  goalResource.goalSetAt = '';
  (stepResource as unknown as { healthKit: unknown }).healthKit = null;
});

afterEach(() => {
  jest.useRealTimers();
  registerHealthKitProvider(null);
});

describe('startup', () => {
  it('sends the player to the start menu when no ship has been chosen', async () => {
    await renderWorld();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByTestId('current-scene')).toHaveTextContent('start_menu');
  });

  it('stays in the world when a hull is stored', async () => {
    useFixedSteps(4321, {});
    await seedSettings({ shipHull: 3, goal: 480, goalSetAt: getDatetimeStringFromSystem() });

    await renderWorld();
    await runStartupSequence();

    expect(screen.getByTestId('current-scene')).toHaveTextContent('world');
  });
});

describe('the HUD', () => {
  beforeEach(async () => {
    useFixedSteps(4321, {});
    await seedSettings({ shipHull: 3, goal: 480, goalSetAt: getDatetimeStringFromSystem() });
  });

  it('places the labels where world.tscn puts them', async () => {
    await renderWorld();
    await runStartupSequence();

    // FuelLabel: offset_left 17, offset_top 62, 176x33.
    expect(screen.getByTestId('fuel-label')).toHaveStyle({
      left: 17,
      top: 62,
      width: 176,
      height: 33,
    });
    // GoalLabel: offset_left 206, offset_top 62, 176x33.
    expect(screen.getByTestId('goal-label-container')).toHaveStyle({
      left: 206,
      top: 62,
      width: 176,
      height: 33,
    });
  });

  it('shows fuel as steps divided by ten, truncated', async () => {
    await renderWorld();
    await runStartupSequence();

    expect(screen.getByTestId('fuel-label')).toHaveTextContent('Fuel: 432');
  });

  it('shows the goal divided by ten', async () => {
    await renderWorld();
    await runStartupSequence();

    expect(screen.getByTestId('goal-label')).toHaveTextContent('Goal: 48');
  });

  it('refreshes the fuel readout on the 2s timer', async () => {
    let steps = 4321;
    registerHealthKitProvider({
      runTodayStepsQuery: () => {},
      runPeriodStepsQuery: () => {},
      getTodaySteps: () => steps,
      getPeriodStepsDict: () => ({}),
    });

    await renderWorld();
    await runStartupSequence();
    expect(screen.getByTestId('fuel-label')).toHaveTextContent('Fuel: 432');

    steps = 9990;
    await act(async () => {
      await jest.advanceTimersByTimeAsync(2100);
    });

    expect(screen.getByTestId('fuel-label')).toHaveTextContent('Fuel: 999');
  });
});

describe('destroying the ship', () => {
  it('clears the hull and reaches game over when the fuel label is tapped', async () => {
    useFixedSteps(4321, {});
    await seedSettings({ shipHull: 3, goal: 480, goalSetAt: getDatetimeStringFromSystem() });

    await renderWorld();
    await runStartupSequence();

    await fireEvent.press(screen.getByTestId('fuel-label'));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1100);
    });

    expect(screen.getByTestId('current-scene')).toHaveTextContent('game_over');

    const config = new ConfigFile();
    await config.load(SETTINGS_FILE_PATH);
    expect(config.getValue('ship_data', 'ship_hull')).toBeNull();
  });

  it('destroys the ship when a day inside the goal period fell short', async () => {
    useFixedSteps(4321, { [getDateStringFromSystem(daysAgo(2))]: 10 });
    await seedSettings({
      shipHull: 3,
      goal: 5000,
      goalSetAt: getDatetimeStringFromSystem(daysAgo(3)),
    });

    await renderWorld();
    await runStartupSequence();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1100);
    });

    expect(screen.getByTestId('current-scene')).toHaveTextContent('game_over');
  });

  it('leaves the ship alone when every day inside the period met the goal', async () => {
    useFixedSteps(4321, { [getDateStringFromSystem(daysAgo(2))]: 9000 });
    await seedSettings({
      shipHull: 3,
      goal: 5000,
      goalSetAt: getDatetimeStringFromSystem(daysAgo(3)),
    });

    await renderWorld();
    await runStartupSequence();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1100);
    });

    expect(screen.getByTestId('current-scene')).toHaveTextContent('world');

    const config = new ConfigFile();
    await config.load(SETTINGS_FILE_PATH);
    expect(config.getValue('ship_data', 'ship_hull', 0)).toBe(3);
  });

  it("ignores today's shortfall, which is still in progress", async () => {
    useFixedSteps(4321, { [getDateStringFromSystem()]: 1 });
    await seedSettings({
      shipHull: 3,
      goal: 5000,
      goalSetAt: getDatetimeStringFromSystem(daysAgo(3)),
    });

    await renderWorld();
    await runStartupSequence();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1100);
    });

    expect(screen.getByTestId('current-scene')).toHaveTextContent('world');
  });
});
