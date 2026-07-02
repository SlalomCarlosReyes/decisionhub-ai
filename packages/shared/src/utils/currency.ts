/**
 * Currency formatting utilities
 */

import { Currency } from '../types/car';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  COP: '$',
  USD: '$',
  EUR: '€',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  COP: 'Colombian Peso',
  USD: 'US Dollar',
  EUR: 'Euro',
};

/**
 * Format a number as currency based on locale
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'COP'
): string {
  const locale = currency === 'COP' ? 'es-CO' : currency === 'EUR' ? 'de-DE' : 'en-US';
  
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  return formatted;
}

/**
 * Format a price with abbreviated millions notation for Colombian market
 * Example: 250000000 -> "COP $250M"
 */
export function formatCOPShort(amount: number): string {
  const millions = amount / 1_000_000;
  
  if (millions >= 1) {
    return `COP $${millions.toFixed(0)}M`;
  }
  
  return formatCurrency(amount, 'COP');
}

/**
 * Parse a budget string to extract amount and currency
 * Examples: "250 million", "250M", "250000000"
 */
export function parseBudget(budgetStr: string): { amount: number; currency: Currency } | null {
  const normalized = budgetStr.toLowerCase().replace(/,/g, '');
  
  // Match patterns like "250 million", "250M", "250000000"
  const millionMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:million|m)/);
  if (millionMatch) {
    return {
      amount: parseFloat(millionMatch[1]) * 1_000_000,
      currency: 'COP',
    };
  }
  
  // Direct number
  const numberMatch = normalized.match(/(\d+)/);
  if (numberMatch) {
    const amount = parseFloat(numberMatch[1]);
    // If number is less than 1000, assume it's in millions
    if (amount < 1000) {
      return { amount: amount * 1_000_000, currency: 'COP' };
    }
    return { amount, currency: 'COP' };
  }
  
  return null;
}
