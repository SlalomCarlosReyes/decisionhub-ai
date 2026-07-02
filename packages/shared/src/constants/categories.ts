/**
 * Shared constants
 */

export const CATEGORIES = {
  CARS: 'cars',
  // Future categories can be added here
  // ELECTRONICS: 'electronics',
  // REAL_ESTATE: 'real_estate',
} as const;

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES];

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const CAR_PRICE_RANGES = {
  BUDGET: { min: 0, max: 25000 },
  MID_RANGE: { min: 25000, max: 50000 },
  LUXURY: { min: 50000, max: 100000 },
  ULTRA_LUXURY: { min: 100000, max: Infinity },
} as const;
