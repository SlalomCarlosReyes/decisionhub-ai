import { Car } from '@decisionhub/shared';
import carsData from './cars.json';

/**
 * Mock data access layer
 * MVP: Loads data from JSON file
 * Future: Replace with database queries
 */

// Simulate async operation (like a database call)
function simulateAsync<T>(data: T, delay = 10): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

export async function loadCarsData(): Promise<Car[]> {
  return simulateAsync(carsData as Car[]);
}

export async function getCarById(id: string): Promise<Car | undefined> {
  const cars = await loadCarsData();
  return cars.find((car) => car.id === id);
}

export async function getCarsByIds(ids: string[]): Promise<Car[]> {
  const cars = await loadCarsData();
  return cars.filter((car) => ids.includes(car.id));
}

// Helper function for future: save car data
export async function saveCarData(car: Car): Promise<Car> {
  // MVP: Not implemented (read-only)
  // Future: Save to database
  throw new Error('Save operation not implemented in MVP');
}

// Helper function for future: update car data
export async function updateCarData(id: string, updates: Partial<Car>): Promise<Car> {
  // MVP: Not implemented (read-only)
  // Future: Update in database
  throw new Error('Update operation not implemented in MVP');
}

// Helper function for future: delete car data
export async function deleteCarData(id: string): Promise<boolean> {
  // MVP: Not implemented (read-only)
  // Future: Delete from database
  throw new Error('Delete operation not implemented in MVP');
}
