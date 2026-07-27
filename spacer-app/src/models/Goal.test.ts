import AsyncStorage from '@react-native-async-storage/async-storage';

import { SETTINGS_FILE_PATH } from '../game/constants';
import { ConfigFile } from '../storage/ConfigFile';
import { getDateStringFromSystem } from '../time/godotTime';
import { Goal } from './Goal';

const DAY = 86400;

beforeEach(async () => {
  await AsyncStorage.clear();
});

/** `resources/goal.tres` — the values the game actually runs with. */
function goalResource() {
  return new Goal({ goalPeriodDays: 30, level: 0.6 });
}

describe('calculateGoal', () => {
  it('averages the period and applies the difficulty level', () => {
    const goal = goalResource();
    // 1000 + 2000 + 3000 = 6000 over a 30 day period, at level 0.6.
    expect(goal.calculateGoal({ '2023-10-01': 1000, '2023-10-02': 2000, '2023-10-03': 3000 })).toBe(
      120,
    );
  });

  it('truncates rather than rounds, matching GDScript int()', () => {
    const goal = new Goal({ goalPeriodDays: 3, level: 0.8 });
    // 1000 / 3 * 0.8 = 266.66...
    expect(goal.calculateGoal({ '2023-10-01': 1000 })).toBe(266);
  });

  it('excludes today, whose step count is still climbing', () => {
    const goal = goalResource();
    const today = getDateStringFromSystem();
    expect(goal.calculateGoal({ '2023-10-01': 1000, [today]: 999999 })).toBe(
      goal.calculateGoal({ '2023-10-01': 1000 }),
    );
  });

  it('is 0 for an empty period', () => {
    expect(goalResource().calculateGoal({})).toBe(0);
  });

  it('honours the exported level from goal.tres over the class default', () => {
    const steps = { '2023-10-01': 3000 };
    expect(new Goal({ goalPeriodDays: 30, level: 0.6 }).calculateGoal(steps)).toBe(60);
    expect(new Goal({ goalPeriodDays: 30 }).calculateGoal(steps)).toBe(80); // default level 0.8
  });
});

describe('sumSteps', () => {
  it('totals every day when not skipping today', () => {
    const today = getDateStringFromSystem();
    expect(goalResource().sumSteps({ '2023-10-01': 1000, [today]: 500 })).toBe(1500);
  });

  it('skips today on request', () => {
    const today = getDateStringFromSystem();
    expect(goalResource().sumSteps({ '2023-10-01': 1000, [today]: 500 }, true)).toBe(1000);
  });
});

describe('shouldUpdateGoal', () => {
  it('is true on a fresh install, where no goal has been set', () => {
    const goal = goalResource();
    expect(goal.goal).toBe(0);
    expect(goal.goalSetAt).toBe('');
    expect(goal.shouldUpdateGoal()).toBe(true);
  });

  it('is false while the current goal is still inside its period', () => {
    const goal = goalResource();
    goal.goal = 120;
    goal.goalSetAt = new Date((Date.now() / 1000 - DAY) * 1000).toISOString().slice(0, 19);
    expect(goal.shouldUpdateGoal()).toBe(false);
  });

  it('is true once the period has elapsed', () => {
    const goal = goalResource();
    goal.goal = 120;
    goal.goalSetAt = new Date((Date.now() / 1000 - 31 * DAY) * 1000).toISOString().slice(0, 19);
    expect(goal.shouldUpdateGoal()).toBe(true);
  });

  it('is true when a goal was set but computed to 0', () => {
    const goal = goalResource();
    goal.goal = 0;
    goal.goalSetAt = new Date().toISOString().slice(0, 19);
    expect(goal.shouldUpdateGoal()).toBe(true);
  });
});

describe('persistence', () => {
  it('does nothing when there is no settings file to write into', async () => {
    const goal = goalResource();
    await goal.updateGoal({ '2023-10-01': 3000 });

    expect(goal.goal).toBe(60);
    expect(await AsyncStorage.getItem(SETTINGS_FILE_PATH)).toBeNull();
  });

  it('writes the goal and its timestamp once the hangar has created the file', async () => {
    const seed = new ConfigFile();
    seed.setValue('ship_data', 'ship_hull', 1);
    await seed.save(SETTINGS_FILE_PATH);

    const goal = goalResource();
    await goal.updateGoal({ '2023-10-01': 1000, '2023-10-02': 2000, '2023-10-03': 3000 });

    const stored = new ConfigFile();
    await stored.load(SETTINGS_FILE_PATH);
    expect(stored.getValue('goal_data', 'goal', 0)).toBe(120);
    expect(stored.getValue('goal_data', 'goal_set_at', '')).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
    );
  });

  it('round-trips through init()', async () => {
    const seed = new ConfigFile();
    seed.setValue('goal_data', 'goal', 480);
    seed.setValue('goal_data', 'goal_set_at', '2025-07-01T08:00:00');
    await seed.save(SETTINGS_FILE_PATH);

    const goal = goalResource();
    await goal.init();

    expect(goal.goal).toBe(480);
    expect(goal.goalSetAt).toBe('2025-07-01T08:00:00');
  });

  it('leaves the defaults in place when no settings file exists', async () => {
    const goal = goalResource();
    await goal.init();

    expect(goal.goal).toBe(0);
    expect(goal.goalSetAt).toBe('');
  });

  it('keeps goalSetAt untouched in memory until the next load', async () => {
    const seed = new ConfigFile();
    seed.setValue('goal_data', 'goal', 0);
    await seed.save(SETTINGS_FILE_PATH);

    const goal = goalResource();
    await goal.updateGoal({ '2023-10-01': 3000 });
    expect(goal.goalSetAt).toBe('');

    await goal.loadGoalSettings();
    expect(goal.goalSetAt).not.toBe('');
  });
});
