import {
  GOAL_DATA_SECTION,
  GOAL_KEY,
  GOAL_SET_AT_KEY,
  SETTINGS_FILE_PATH,
} from '../game/constants';
import { ConfigFile, OK } from '../storage/ConfigFile';
import {
  getDateStringFromSystem,
  getDatetimeStringFromSystem,
  getUnixTimeFromDatetimeString,
  getUnixTimeFromSystem,
} from '../time/godotTime';

const SECONDS_PER_DAY = 86400;

export interface GoalOptions {
  goalPeriodDays?: number;
  level?: number;
}

/**
 * Port of `resources/goal.gd` (`class_name Goal extends Resource`).
 *
 * `goal_period_days` and `level` are `@export` properties, so the values that
 * actually run are the ones serialised into `resources/goal.tres` — see
 * `src/resources/index.ts`.
 */
export class Goal {
  goalPeriodDays: number;
  level: number;

  goal = 0;
  goalSetAt = '';

  constructor({ goalPeriodDays = 30, level = 0.8 }: GoalOptions = {}) {
    this.goalPeriodDays = goalPeriodDays;
    this.level = level;
  }

  async init(): Promise<void> {
    await this.loadGoalSettings();
  }

  async updateGoal(stepsData: Record<string, number>): Promise<void> {
    this.goal = this.calculateGoal(stepsData);
    await this.saveGoal(this.goal);
  }

  /**
   * `average(steps for the period) * level`, with today excluded because the
   * day is still in progress. Truncated, matching GDScript's `int()`.
   */
  calculateGoal(stepsData: Record<string, number>): number {
    const totalSteps = this.sumSteps(stepsData, true);
    return Math.trunc((totalSteps / this.goalPeriodDays) * this.level);
  }

  sumSteps(stepsData: Record<string, number>, skipToday = false): number {
    let total = 0;
    const today = getDateStringFromSystem();

    for (const date of Object.keys(stepsData)) {
      if (skipToday && date === today) {
        continue;
      }
      total += stepsData[date];
    }

    return total;
  }

  shouldUpdateGoal(): boolean {
    const goalExpiryTime =
      getUnixTimeFromDatetimeString(this.goalSetAt) + this.goalPeriodDays * SECONDS_PER_DAY;
    return this.goal === 0 || getUnixTimeFromSystem() > goalExpiryTime;
  }

  async saveGoal(newGoal: number): Promise<void> {
    const config = new ConfigFile();
    if ((await config.load(SETTINGS_FILE_PATH)) !== OK) {
      console.log('Failed to load config file');
      return;
    }

    // Deliberately not mirrored into `this.goalSetAt`: `save_goal()` only writes
    // to disk, and every scene that needs the timestamp calls
    // `load_goal_settings()` on entry.
    config.setValue(GOAL_DATA_SECTION, GOAL_KEY, newGoal);
    config.setValue(GOAL_DATA_SECTION, GOAL_SET_AT_KEY, getDatetimeStringFromSystem());

    if ((await config.save(SETTINGS_FILE_PATH)) !== OK) {
      console.log('Failed to save config file');
    }
  }

  async loadGoalSettings(): Promise<void> {
    const config = new ConfigFile();
    if ((await config.load(SETTINGS_FILE_PATH)) === OK) {
      this.goal = config.getValue(GOAL_DATA_SECTION, GOAL_KEY, 0);
      this.goalSetAt = config.getValue(GOAL_DATA_SECTION, GOAL_SET_AT_KEY, '');
    } else {
      console.log('Could not load goal settings');
    }
  }
}
