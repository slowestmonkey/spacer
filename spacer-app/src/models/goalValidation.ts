import { getUnixTimeFromDatetimeString } from '../time/godotTime';

/**
 * `world.gd -> is_outside_goal_period()`.
 *
 * Days before the goal was set do not count (the player never agreed to that
 * target), and today does not count either because it is still in progress.
 */
export function isOutsideGoalPeriod(
  dateTime: number,
  goalStartTime: number,
  todayTime: number,
): boolean {
  return dateTime < goalStartTime || dateTime >= todayTime;
}

export interface GoalValidationInput {
  stepsData: Record<string, number>;
  goal: number;
  goalSetAt: string;
  todayTime: number;
}

/**
 * `world.gd -> validate_goal()`, expressed as a query instead of a side effect.
 *
 * The original calls `destroy_ship()` once per day that fell short; the ship can
 * only be destroyed once, so returning the failing days keeps the behaviour and
 * makes the rule testable.
 */
export function findFailedGoalDays({
  stepsData,
  goal,
  goalSetAt,
  todayTime,
}: GoalValidationInput): string[] {
  const goalStartTime = getUnixTimeFromDatetimeString(goalSetAt);
  const failedDays: string[] = [];

  for (const dateKey of Object.keys(stepsData)) {
    const dateTime = getUnixTimeFromDatetimeString(dateKey);
    if (isOutsideGoalPeriod(dateTime, goalStartTime, todayTime)) {
      continue;
    }

    if (stepsData[dateKey] < goal) {
      failedDays.push(dateKey);
    }
  }

  return failedDays;
}
