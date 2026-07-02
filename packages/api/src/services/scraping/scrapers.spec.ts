/**
 * Unit Tests: Web Scrapers (TuCarro & OLX)
 * 
 * Tests para scrapers de precios locales
 * Nota: No hacemos requests reales, solo testeamos lógica de parsing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TuCarroScraper } from './tuCarroScraper.js';
import { OLXScraper } from './olxScraper.js';

describe('TuCarroScraper', () => {
  let scraper: TuCarroScraper;

  beforeEach(() => {
    scraper = new TuCarroScraper();
  });

  describe('Price Parsing', () => {
    it('should parse price correctly', () => {
      // @ts-ignore - Accessing private method for testing
      const price1 = scraper.parsePrice('$ 45.000.000');
      expect(price1).toBe(45000000);

      // @ts-ignore
      const price2 = scraper.parsePrice('$85.000.000');
      expect(price2).toBe(85000000);

      // @ts-ignore
      const price3 = scraper.parsePrice('120000000');
      expect(price3).toBe(120000000);
    });

    it('should return undefined for invalid prices', () => {
      // @ts-ignore
      const price = scraper.parsePrice('No price');
      expect(price).toBeUndefined();
    });
  });

  describe('Year Extraction', () => {
    it('should extract year from title', () => {
      // @ts-ignore
      const year1 = scraper.extractYear('Honda Civic 2022 - Excelente estado');
      expect(year1).toBe(2022);

      // @ts-ignore
      const year2 = scraper.extractYear('Toyota Corolla 2020');
      expect(year2).toBe(2020);

      // @ts-ignore
      const year3 = scraper.extractYear('Mazda 3 1995');
      expect(year3).toBe(1995);
    });

    it('should return undefined when no year found', () => {
      // @ts-ignore
      const year = scraper.extractYear('Honda Civic - Buen estado');
      expect(year).toBeUndefined();
    });

    it('should reject invalid years', () => {
      // @ts-ignore
      const year1 = scraper.extractYear('Car from 1989');
      expect(year1).toBeUndefined();

      // @ts-ignore
      const year2 = scraper.extractYear('Car from 2050');
      expect(year2).toBeUndefined();
    });
  });

  describe('Mileage Extraction', () => {
    it('should extract mileage from text', () => {
      // @ts-ignore
      const mileage1 = scraper.extractMileage('50000 km');
      expect(mileage1).toBe(50000);

      // @ts-ignore
      const mileage2 = scraper.extractMileage('15.000 km');
      expect(mileage2).toBe(15000);

      // @ts-ignore
      const mileage3 = scraper.extractMileage('120000km');
      expect(mileage3).toBe(120000);
    });

    it('should return undefined when no mileage found', () => {
      // @ts-ignore
      const mileage = scraper.extractMileage('Sin kilometraje');
      expect(mileage).toBeUndefined();
    });
  });

  describe('Price Range Calculation', () => {
    it('should calculate price range correctly', () => {
      const listings = [
        { title: 'Car 1', price: 50000000, url: 'url1' },
        { title: 'Car 2', price: 75000000, url: 'url2' },
        { title: 'Car 3', price: 100000000, url: 'url3' },
      ];

      // @ts-ignore
      const range = scraper.calculatePriceRange(listings);

      expect(range.min).toBe(50000000);
      expect(range.max).toBe(100000000);
      expect(range.average).toBe(75000000);
    });

    it('should handle empty listings', () => {
      // @ts-ignore
      const range = scraper.calculatePriceRange([]);

      expect(range.min).toBe(0);
      expect(range.max).toBe(0);
      expect(range.average).toBe(0);
    });

    it('should handle single listing', () => {
      const listings = [
        { title: 'Car 1', price: 60000000, url: 'url1' },
      ];

      // @ts-ignore
      const range = scraper.calculatePriceRange(listings);

      expect(range.min).toBe(60000000);
      expect(range.max).toBe(60000000);
      expect(range.average).toBe(60000000);
    });
  });

  describe('Search Query Building', () => {
    it('should build search query correctly', () => {
      // @ts-ignore
      const query1 = scraper.buildSearchQuery('Honda', 'Civic', 2022);
      expect(query1).toContain('honda');
      expect(query1).toContain('civic');
      expect(query1).toContain('2022');

      // @ts-ignore
      const query2 = scraper.buildSearchQuery('Toyota', 'Corolla');
      expect(query2).toContain('toyota');
      expect(query2).toContain('corolla');
    });

    it('should clean special characters', () => {
      // @ts-ignore
      const query = scraper.buildSearchQuery('Chevrolet', 'Spark GT', 2021);
      expect(query).not.toContain(' ');
      expect(query).toContain('-');
    });
  });
});

describe('OLXScraper', () => {
  let scraper: OLXScraper;

  beforeEach(() => {
    scraper = new OLXScraper();
  });

  describe('Price Parsing', () => {
    it('should parse price correctly', () => {
      // @ts-ignore
      const price1 = scraper.parsePrice('$ 45.000.000');
      expect(price1).toBe(45000000);

      // @ts-ignore
      const price2 = scraper.parsePrice('$ 85,000,000');
      expect(price2).toBe(85000000);

      // @ts-ignore
      const price3 = scraper.parsePrice('120000000');
      expect(price3).toBe(120000000);
    });

    it('should return undefined for invalid prices', () => {
      // @ts-ignore
      const price = scraper.parsePrice('Precio a consultar');
      expect(price).toBeUndefined();
    });
  });

  describe('Year Extraction', () => {
    it('should extract year from title', () => {
      // @ts-ignore
      const year = scraper.extractYear('Renault Logan 2021 - Como nuevo');
      expect(year).toBe(2021);
    });

    it('should reject out-of-range years', () => {
      // @ts-ignore
      const year = scraper.extractYear('Classic car 1985');
      expect(year).toBeUndefined();
    });
  });

  describe('Mileage Extraction', () => {
    it('should extract mileage with dots', () => {
      // @ts-ignore
      const mileage = scraper.extractMileage('Kilometraje: 45.000 km');
      expect(mileage).toBe(45000);
    });

    it('should extract mileage with commas', () => {
      // @ts-ignore
      const mileage = scraper.extractMileage('80,000 km recorridos');
      expect(mileage).toBe(80000);
    });

    it('should return undefined when no mileage', () => {
      // @ts-ignore
      const mileage = scraper.extractMileage('0 km - Nuevo');
      expect(mileage).toBe(0);
    });
  });

  describe('Price Range Calculation', () => {
    it('should calculate range with multiple listings', () => {
      const listings = [
        { title: 'Car 1', price: 40000000, url: 'url1' },
        { title: 'Car 2', price: 60000000, url: 'url2' },
        { title: 'Car 3', price: 80000000, url: 'url3' },
      ];

      // @ts-ignore
      const range = scraper.calculatePriceRange(listings);

      expect(range.min).toBe(40000000);
      expect(range.max).toBe(80000000);
      expect(range.average).toBe(60000000);
    });
  });

  describe('Search Query Building', () => {
    it('should build URL-encoded query', () => {
      // @ts-ignore
      const query = scraper.buildSearchQuery('Nissan', 'Sentra', 2020);
      expect(query).toContain('q=');
      expect(query).toContain('Nissan');
      expect(query).toContain('Sentra');
      expect(query).toContain('2020');
    });

    it('should handle special characters in query', () => {
      // @ts-ignore
      const query = scraper.buildSearchQuery('Chevrolet', 'Spark GT', 2019);
      expect(query).toContain('q=');
      expect(decodeURIComponent(query)).toContain('Chevrolet Spark GT 2019');
    });
  });
});

describe('Scraper Error Handling', () => {
  it('TuCarro should handle robots.txt blocking', async () => {
    const scraper = new TuCarroScraper();
    
    // Mock isAllowedByRobotsTxt to return false
    vi.spyOn(scraper as any, 'isAllowedByRobotsTxt').mockResolvedValue(false);

    const result = await scraper.searchVehicle('Honda', 'Civic', 2022);

    expect(result.available).toBe(false);
    expect(result.message).toContain('robots.txt');
  });

  it('OLX should handle robots.txt blocking', async () => {
    const scraper = new OLXScraper();
    
    vi.spyOn(scraper as any, 'isAllowedByRobotsTxt').mockResolvedValue(false);

    const result = await scraper.searchVehicle('Toyota', 'Corolla', 2021);

    expect(result.available).toBe(false);
    expect(result.message).toContain('robots.txt');
  });
});
