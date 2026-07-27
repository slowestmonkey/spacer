import { registerHealthKitProvider } from '../health/healthKit';
import type { HealthKitProvider } from '../health/types';
import { SIMULATED_PERIOD_STEPS, Step } from './Step';

afterEach(() => {
  registerHealthKitProvider(null);
});

function fakeHealthKit(overrides: Partial<HealthKitProvider> = {}) {
  return {
    runTodayStepsQuery: jest.fn(),
    runPeriodStepsQuery: jest.fn(),
    getTodaySteps: jest.fn(() => 7321),
    getPeriodStepsDict: jest.fn(() => ({ '2025-07-25': 8000 })),
    ...overrides,
  };
}

describe('without a HealthKit provider', () => {
  it('simulates a plausible step count so the game stays playable', async () => {
    const step = new Step();
    await step.init(30);

    for (let i = 0; i < 50; i += 1) {
      const steps = await step.fetchTodaySteps();
      expect(steps).toBeGreaterThanOrEqual(10);
      expect(steps).toBeLessThanOrEqual(10000);
    }
  });

  it('returns the same simulated period data as the Godot fallback', async () => {
    const step = new Step();
    expect(await step.fetchStepsForPeriod()).toEqual(SIMULATED_PERIOD_STEPS);
  });

  it('hands back a copy, so a caller cannot corrupt the fallback', async () => {
    const step = new Step();
    const first = await step.fetchStepsForPeriod();
    first['2023-10-01'] = 999999;
    expect((await step.fetchStepsForPeriod())['2023-10-01']).toBe(1000);
  });
});

describe('with a HealthKit provider', () => {
  it('primes both queries on init', async () => {
    const healthKit = fakeHealthKit();
    registerHealthKitProvider(healthKit);

    const step = new Step();
    await step.init(30);

    expect(healthKit.runTodayStepsQuery).toHaveBeenCalledTimes(1);
    expect(healthKit.runPeriodStepsQuery).toHaveBeenCalledWith(30);
  });

  it('re-runs the today query on every read', async () => {
    const healthKit = fakeHealthKit();
    registerHealthKitProvider(healthKit);

    const step = new Step();
    await step.init(30);
    expect(await step.fetchTodaySteps()).toBe(7321);
    expect(healthKit.runTodayStepsQuery).toHaveBeenCalledTimes(2);
  });

  it('reads the period dictionary straight through', async () => {
    const healthKit = fakeHealthKit();
    registerHealthKitProvider(healthKit);

    const step = new Step();
    await step.init(30);
    expect(await step.fetchStepsForPeriod()).toEqual({ '2025-07-25': 8000 });
  });

  it('keeps simulating when the provider is registered after init', async () => {
    const step = new Step();
    await step.init(30);

    registerHealthKitProvider(fakeHealthKit());

    // `Step` caches the singleton it resolved at init time, like `step.gd`.
    expect(await step.fetchStepsForPeriod()).toEqual(SIMULATED_PERIOD_STEPS);
  });

  it('does not re-resolve the provider once one is attached', async () => {
    const healthKit = fakeHealthKit();
    registerHealthKitProvider(healthKit);

    const step = new Step();
    await step.init(30);
    await step.init(30);

    expect(healthKit.runPeriodStepsQuery).toHaveBeenCalledTimes(1);
  });
});
