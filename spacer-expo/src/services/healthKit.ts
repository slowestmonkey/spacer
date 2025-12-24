/**
 * HealthKit service
 *
 * In Expo Go: Uses mock data (HealthKit requires native build)
 * In dev build: Uses real HealthKit via @kingstinct/react-native-healthkit
 *
 * To use real HealthKit:
 *   npx expo prebuild
 *   npx expo run:ios
 */

// For now, always use mock data
// TODO: Add real HealthKit when using dev build

export async function requestPermissions(): Promise<boolean> {
  console.log('Using mock step data (run `npx expo prebuild` for real HealthKit)');
  return true;
}

export async function getTodaySteps(): Promise<number> {
  // Mock: consistent-ish random based on time (so it doesn't jump wildly)
  const hour = new Date().getHours();
  const baseSteps = 500 * hour; // ~500 steps per hour
  const variance = Math.floor(Math.random() * 200) - 100;
  return Math.max(0, baseSteps + variance);
}

export async function getStepsForDate(date: Date): Promise<number> {
  // Mock: generate predictable steps for past dates
  const seed = date.getDate() + date.getMonth() * 31;
  return 4000 + (seed * 137) % 8000; // 4000-12000 steps
}

export async function getStepsForLastDays(days: number): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    result[dateKey] = await getStepsForDate(date);
  }

  return result;
}
