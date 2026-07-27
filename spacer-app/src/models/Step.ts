import { resolveHealthKit } from '../health/healthKit';
import type { HealthKitProvider } from '../health/types';
import { randiRange } from '../time/godotTime';

/**
 * Port of `resources/step.gd` (`class_name Step extends Resource`).
 *
 * The simulated values are the same ones the Godot build falls back to when the
 * HealthKit plugin is missing, so the mock playthrough behaves identically.
 */
export const SIMULATED_PERIOD_STEPS: Record<string, number> = {
  '2023-10-01': 1000,
  '2023-10-02': 2000,
  '2023-10-03': 3000,
};

export class Step {
  private healthKit: HealthKitProvider | null = null;

  async init(periodDays: number): Promise<void> {
    if (!this.healthKit) {
      const healthKit = resolveHealthKit();
      if (healthKit) {
        this.healthKit = healthKit;
        await healthKit.runTodayStepsQuery();
        await healthKit.runPeriodStepsQuery(periodDays);
      }
    }
  }

  async fetchTodaySteps(): Promise<number> {
    if (!this.healthKit) {
      return randiRange(10, 10000);
    }

    await this.healthKit.runTodayStepsQuery();

    return this.healthKit.getTodaySteps();
  }

  async fetchStepsForPeriod(): Promise<Record<string, number>> {
    if (!this.healthKit) {
      return { ...SIMULATED_PERIOD_STEPS };
    }
    return this.healthKit.getPeriodStepsDict();
  }
}
