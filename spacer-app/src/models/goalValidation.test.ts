import { getUnixTimeFromDatetimeString } from '../time/godotTime';
import { findFailedGoalDays, isOutsideGoalPeriod } from './goalValidation';

const day = (date: string) => getUnixTimeFromDatetimeString(date);

const GOAL_SET_AT = '2025-07-01T08:00:00';
const TODAY = day('2025-07-10');

describe('isOutsideGoalPeriod', () => {
  it('excludes days before the goal was agreed to', () => {
    expect(isOutsideGoalPeriod(day('2025-06-30'), day(GOAL_SET_AT), TODAY)).toBe(true);
  });

  it('excludes today, which is still in progress', () => {
    expect(isOutsideGoalPeriod(TODAY, day(GOAL_SET_AT), TODAY)).toBe(true);
  });

  it('excludes any day in the future', () => {
    expect(isOutsideGoalPeriod(day('2025-07-11'), day(GOAL_SET_AT), TODAY)).toBe(true);
  });

  it('includes a completed day inside the period', () => {
    expect(isOutsideGoalPeriod(day('2025-07-05'), day(GOAL_SET_AT), TODAY)).toBe(false);
  });
});

describe('findFailedGoalDays', () => {
  const goal = 5000;

  it('flags a day inside the period that fell short', () => {
    expect(
      findFailedGoalDays({
        stepsData: { '2025-07-05': 4999 },
        goal,
        goalSetAt: GOAL_SET_AT,
        todayTime: TODAY,
      }),
    ).toEqual(['2025-07-05']);
  });

  it('treats hitting the goal exactly as a pass', () => {
    expect(
      findFailedGoalDays({
        stepsData: { '2025-07-05': 5000 },
        goal,
        goalSetAt: GOAL_SET_AT,
        todayTime: TODAY,
      }),
    ).toEqual([]);
  });

  it('ignores a shortfall from before the goal was set', () => {
    expect(
      findFailedGoalDays({
        stepsData: { '2025-06-20': 0 },
        goal,
        goalSetAt: GOAL_SET_AT,
        todayTime: TODAY,
      }),
    ).toEqual([]);
  });

  it("ignores today's incomplete count", () => {
    expect(
      findFailedGoalDays({
        stepsData: { '2025-07-10': 12 },
        goal,
        goalSetAt: GOAL_SET_AT,
        todayTime: TODAY,
      }),
    ).toEqual([]);
  });

  it('reports every failing day', () => {
    expect(
      findFailedGoalDays({
        stepsData: {
          '2025-06-30': 0,
          '2025-07-02': 100,
          '2025-07-03': 9000,
          '2025-07-04': 4000,
          '2025-07-10': 0,
        },
        goal,
        goalSetAt: GOAL_SET_AT,
        todayTime: TODAY,
      }),
    ).toEqual(['2025-07-02', '2025-07-04']);
  });

  it('spares the simulated period, which predates any goal', () => {
    // What `Step` returns without a HealthKit provider: the goal is set today,
    // so the 2023 sample days are all outside the period and the ship survives.
    expect(
      findFailedGoalDays({
        stepsData: { '2023-10-01': 1000, '2023-10-02': 2000, '2023-10-03': 3000 },
        goal: 120,
        goalSetAt: GOAL_SET_AT,
        todayTime: TODAY,
      }),
    ).toEqual([]);
  });

  it('does not destroy the ship when the goal is still 0', () => {
    expect(
      findFailedGoalDays({
        stepsData: { '2025-07-05': 0 },
        goal: 0,
        goalSetAt: GOAL_SET_AT,
        todayTime: TODAY,
      }),
    ).toEqual([]);
  });

  it('treats an unset goalSetAt as "since the epoch"', () => {
    expect(
      findFailedGoalDays({
        stepsData: { '2025-07-05': 1 },
        goal,
        goalSetAt: '',
        todayTime: TODAY,
      }),
    ).toEqual(['2025-07-05']);
  });
});
