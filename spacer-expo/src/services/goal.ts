const GOAL_PERIOD_DAYS = 30;
const DIFFICULTY_LEVEL = 0.8; // 80% of average

export interface GoalState {
  goal: number;
  goalSetAt: string | null; // ISO date string
}

/**
 * Calculate goal from steps data (average * difficulty level)
 * Skips today's steps in calculation
 */
export function calculateGoal(stepsData: Record<string, number>): number {
  const today = new Date().toISOString().split('T')[0];

  let total = 0;
  let count = 0;

  for (const [date, steps] of Object.entries(stepsData)) {
    if (date === today) continue; // Skip today
    total += steps;
    count++;
  }

  if (count === 0) return 0;

  const average = total / GOAL_PERIOD_DAYS;
  return Math.floor(average * DIFFICULTY_LEVEL);
}

/**
 * Check if goal needs to be recalculated (expired or not set)
 */
export function shouldUpdateGoal(goal: number, goalSetAt: string | null): boolean {
  if (goal === 0 || !goalSetAt) return true;

  const goalSetTime = new Date(goalSetAt).getTime();
  const expiryTime = goalSetTime + GOAL_PERIOD_DAYS * 24 * 60 * 60 * 1000;

  return Date.now() > expiryTime;
}

/**
 * Validate if all days in goal period met the goal
 * Returns the first failing date, or null if all passed
 */
export function validateGoalPeriod(
  stepsData: Record<string, number>,
  goal: number,
  goalSetAt: string | null
): string | null {
  if (!goalSetAt || goal === 0) return null;

  const goalStartTime = new Date(goalSetAt).getTime();
  const todayStart = getStartOfToday().getTime();

  for (const [dateKey, steps] of Object.entries(stepsData)) {
    const dateTime = new Date(dateKey).getTime();

    // Skip dates outside goal period
    if (dateTime < goalStartTime || dateTime >= todayStart) {
      continue;
    }

    // Check if this day failed
    if (steps < goal) {
      return dateKey;
    }
  }

  return null; // All days passed
}

function getStartOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export { GOAL_PERIOD_DAYS };
