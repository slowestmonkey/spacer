import type { HealthKitProvider } from './types';

/**
 * `Engine.has_singleton("HealthKit")` / `Engine.get_singleton("HealthKit")`.
 *
 * Nothing in this repository provides a HealthKit implementation, exactly like
 * the Godot project — there the plugin is a separately built `libHealthKitPlugin.a`
 * that you copy into `ios/plugins/healthkit`. Register a provider here (see
 * README, "Wiring up Apple Health") and `Step` will start using real step data;
 * until then every screen runs on simulated numbers so the game is playable on
 * a simulator or any unsupported environment.
 */
let registeredProvider: HealthKitProvider | null = null;

export function registerHealthKitProvider(provider: HealthKitProvider | null): void {
  registeredProvider = provider;
}

export function hasHealthKit(): boolean {
  return resolveHealthKit() !== null;
}

export function resolveHealthKit(): HealthKitProvider | null {
  return registeredProvider;
}
