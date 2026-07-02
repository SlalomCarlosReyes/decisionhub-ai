/**
 * Shared utility functions and validators
 */

import { CarSearchCriteria } from '../types/car';

export function isValidPrice(price: number): boolean {
  return price >= 0 && price <= 1000000;
}

export function isValidYear(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 2;
}

export function validateCarSearchCriteria(
  criteria: CarSearchCriteria
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (criteria.minPrice !== undefined && !isValidPrice(criteria.minPrice)) {
    errors.push('Invalid minimum price');
  }

  if (criteria.maxPrice !== undefined && !isValidPrice(criteria.maxPrice)) {
    errors.push('Invalid maximum price');
  }

  if (
    criteria.minPrice !== undefined &&
    criteria.maxPrice !== undefined &&
    criteria.minPrice > criteria.maxPrice
  ) {
    errors.push('Minimum price cannot be greater than maximum price');
  }

  if (criteria.minYear !== undefined && !isValidYear(criteria.minYear)) {
    errors.push('Invalid minimum year');
  }

  if (criteria.maxYear !== undefined && !isValidYear(criteria.maxYear)) {
    errors.push('Invalid maximum year');
  }

  if (
    criteria.minYear !== undefined &&
    criteria.maxYear !== undefined &&
    criteria.minYear > criteria.maxYear
  ) {
    errors.push('Minimum year cannot be greater than maximum year');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}
