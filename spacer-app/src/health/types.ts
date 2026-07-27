/**
 * Shape of the Godot HealthKit singleton the original talks to.
 *
 * `resources/step.gd`:
 *   health_kit = Engine.get_singleton("HealthKit")
 *   health_kit.run_today_steps_query()
 *   health_kit.run_period_steps_query(period_days)
 *   health_kit.get_today_steps()        -> int
 *   health_kit.get_period_steps_dict()  -> { "YYYY-MM-DD": int }
 *
 * The Godot build ships without the plugin unless you compile and drop in
 * `libHealthKitPlugin.a`, and falls back to simulated data when the singleton
 * is absent. The port keeps that contract: `resolveHealthKit()` returns `null`
 * whenever no provider is installed, and `Step` simulates instead.
 */
export interface HealthKitProvider {
  runTodayStepsQuery(): void | Promise<void>;
  runPeriodStepsQuery(periodDays: number): void | Promise<void>;
  getTodaySteps(): number;
  getPeriodStepsDict(): Record<string, number>;
}
