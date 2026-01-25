import { Platform } from 'react-native';
import { HealthData } from '../types';

// Mock data for development/testing
const MOCK_STEPS_TODAY = 4500;
const MOCK_HISTORICAL_AVERAGE = 5000;

// Flag to force mock mode (useful for simulator testing)
const FORCE_MOCK_MODE = true;

class HealthService {
  private isInitialized = false;
  private useMockData = FORCE_MOCK_MODE;

  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios' || FORCE_MOCK_MODE) {
      console.log('Using mock health data');
      this.useMockData = true;
      this.isInitialized = true;
      return true;
    }

    try {
      const AppleHealthKit = require('react-native-health').default;
      const permissions = {
        permissions: {
          read: ['StepCount'],
        },
      };

      return new Promise((resolve) => {
        AppleHealthKit.initHealthKit(permissions, (error: string) => {
          if (error) {
            console.log('HealthKit init error, using mock data:', error);
            this.useMockData = true;
          }
          this.isInitialized = true;
          resolve(true);
        });
      });
    } catch (e) {
      console.log('HealthKit not available, using mock data');
      this.useMockData = true;
      this.isInitialized = true;
      return true;
    }
  }

  async getStepsToday(): Promise<number> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.useMockData) {
      // Return mock data with some variation
      const variation = Math.floor(Math.random() * 1000) - 500;
      return MOCK_STEPS_TODAY + variation;
    }

    try {
      const AppleHealthKit = require('react-native-health').default;
      const options = {
        date: new Date().toISOString(),
        includeManuallyAdded: true,
      };

      return new Promise((resolve) => {
        AppleHealthKit.getStepCount(
          options,
          (err: string, results: { value: number }) => {
            if (err) {
              console.log('Error getting steps:', err);
              resolve(MOCK_STEPS_TODAY);
              return;
            }
            resolve(results?.value || 0);
          }
        );
      });
    } catch (e) {
      return MOCK_STEPS_TODAY;
    }
  }

  async getStepsHistory(days: number = 30): Promise<{ date: string; steps: number }[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.useMockData) {
      // Generate mock historical data
      const history: { date: string; steps: number }[] = [];
      for (let i = days; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const variation = Math.floor(Math.random() * 2000) - 1000;
        history.push({
          date: date.toISOString().split('T')[0],
          steps: Math.max(0, MOCK_HISTORICAL_AVERAGE + variation),
        });
      }
      return history;
    }

    try {
      const AppleHealthKit = require('react-native-health').default;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const options = {
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      };

      return new Promise((resolve) => {
        AppleHealthKit.getDailyStepCountSamples(
          options,
          (err: string, results: { startDate: string; value: number }[]) => {
            if (err || !results) {
              console.log('Error getting history:', err);
              resolve([]);
              return;
            }

            const history = results.map((r) => ({
              date: r.startDate.split('T')[0],
              steps: r.value,
            }));
            resolve(history);
          }
        );
      });
    } catch (e) {
      return [];
    }
  }

  async getHealthData(): Promise<HealthData> {
    const stepsToday = await this.getStepsToday();
    const stepsHistory = await this.getStepsHistory();
    return { stepsToday, stepsHistory };
  }

  // For testing different states
  setMockSteps(steps: number): void {
    // This is handled through the store for testing
  }
}

export const healthService = new HealthService();
