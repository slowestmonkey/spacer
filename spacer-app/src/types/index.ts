export type ShipState = 'healthy' | 'warning' | 'damaged' | 'critical' | 'destroyed';

export interface GameState {
  // Ship state
  shipState: ShipState;
  consecutiveFailures: number;

  // Fuel & Goals
  currentFuel: number;
  dailyGoal: number;
  stepsToday: number;

  // Calibration
  isCalibrating: boolean;
  calibrationDaysRemaining: number;
  historicalSteps: number[];

  // Journey
  journeyStartDate: string | null;
  lastCheckedDate: string | null;

  // Settings
  hasCompletedOnboarding: boolean;
}

export interface HealthData {
  stepsToday: number;
  stepsHistory: { date: string; steps: number }[];
}
