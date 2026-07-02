/**
 * TuCarro.com Scraper
 * 
 * Web scraper para extraer precios de vehículos del mercado colombiano
 * desde TuCarro.com (portal de clasificados de autos en Colombia)
 * 
 * IMPORTANTE: Respeta robots.txt y límites de rate limiting
 */

import * as cheerio from 'cheerio';
import { BaseScraper } from './baseScraper.js';
import { tuCarroLimiter } from './rateLimiter.js';

export interface TuCarroListing {
  title: string;
  price: number; // En COP
  year?: number;
  mileage?: number; // En kilómetros
  location?: string;
  url: string;
  images?: string[];
  seller?: string;
}

export interface TuCarroSearchResult {
  available: boolean;
  listings: TuCarroListing[];
  priceRange?: {
    min: number;
    max: number;
    average: number;
  };
  count: number;
  source: 'tucarro';
  message?: string;
}

/**
 * Scraper para TuCarro.com
 * Extrae información de precios del mercado colombiano
 */
export class TuCarroScraper extends BaseScraper {
  private readonly baseURL = 'https://carros.tucarro.com.co';

  constructor() {
    super('TuCarro');
  }

  /**
   * Busca listados de un vehículo específico
   */
  async searchVehicle(
    make: string,
    model: string,
    year?: number
  ): Promise<TuCarroSearchResult> {
    try {
      console.log(`[TuCarro] Searching for ${make} ${model}${year ? ` ${year}` : ''}`);

      // Verificar robots.txt
      const allowed = await this.isAllowedByRobotsTxt(this.baseURL, '/');
      if (!allowed) {
        console.warn('[TuCarro] Blocked by robots.txt');
        return {
          available: false,
          listings: [],
          count: 0,
          source: 'tucarro',
          message: 'Blocked by robots.txt policy',
        };
      }

      // Usar rate limiter
      const result = await tuCarroLimiter.schedule(async () => {
        return await this.fetchListings(make, model, year);
      });

      return result;
    } catch (error) {
      console.error('[TuCarro] Error scraping:', error);
      return {
        available: false,
        listings: [],
        count: 0,
        source: 'tucarro',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Obtiene los listados de la página
   */
  private async fetchListings(
    make: string,
    model: string,
    year?: number
  ): Promise<TuCarroSearchResult> {
    try {
      // Construir query de búsqueda
      const searchQuery = this.buildSearchQuery(make, model, year);
      const searchURL = `${this.baseURL}/${searchQuery}`;

      console.log(`[TuCarro] Fetching: ${searchURL}`);

      // Fetch HTML con timeout y retry
      const html = await this.retry(
        async () => await this.fetchHTML(searchURL),
        3,
        1000
      );

      if (!html) {
        return {
          available: false,
          listings: [],
          count: 0,
          source: 'tucarro',
          message: 'Failed to fetch page',
        };
      }

      // Parsear listings
      const listings = this.parseListings(html);

      if (listings.length === 0) {
        return {
          available: false,
          listings: [],
          count: 0,
          source: 'tucarro',
          message: 'No listings found',
        };
      }

      // Calcular rango de precios
      const priceRange = this.calculatePriceRange(listings);

      return {
        available: true,
        listings,
        priceRange,
        count: listings.length,
        source: 'tucarro',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Construye el query de búsqueda
   */
  private buildSearchQuery(make: string, model: string, year?: number): string {
    // TuCarro usa formato: /marca-modelo-año/_NoIndex_True
    let query = `${make.toLowerCase()}-${model.toLowerCase()}`;
    
    if (year) {
      query += `-${year}`;
    }
    
    // Limpiar espacios y caracteres especiales
    query = query.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '');
    
    return `${query}/_NoIndex_True`;
  }

  /**
   * Parsea los listados de la página HTML
   */
  private parseListings(html: string): TuCarroListing[] {
    const $ = cheerio.load(html);
    const listings: TuCarroListing[] = [];

    // TuCarro usa estructura de Mercado Libre
    // Selectores pueden variar, estos son aproximados
    $('.ui-search-result').each((_, element) => {
      try {
        const $el = $(element);
        
        // Extraer título
        const title = $el.find('.ui-search-item__title').text().trim();
        if (!title) return;

        // Extraer precio
        const priceText = $el.find('.price-tag-amount .price-tag-fraction').text().trim();
        const price = this.parsePrice(priceText);
        if (!price) return;

        // Extraer URL
        const url = $el.find('a.ui-search-link').attr('href') || '';
        if (!url) return;

        // Extraer otros datos si están disponibles
        const year = this.extractYear(title);
        const mileage = this.extractMileage($el.find('.ui-search-item__group__element').text());
        const location = $el.find('.ui-search-item__location').text().trim() || undefined;

        listings.push({
          title,
          price,
          year,
          mileage,
          location,
          url,
        });
      } catch (error) {
        // Skip invalid listings
        console.warn('[TuCarro] Failed to parse listing:', error);
      }
    });

    return listings;
  }

  /**
   * Convierte texto de precio a número
   */
  private parsePrice(priceText: string): number | undefined {
    if (!priceText) return undefined;
    
    // Remover símbolos y espacios: "$ 45.000.000" -> "45000000"
    const cleaned = priceText.replace(/[$\s.]/g, '');
    const price = parseInt(cleaned);
    
    return isNaN(price) ? undefined : price;
  }

  /**
   * Extrae el año del título
   */
  private extractYear(title: string): number | undefined {
    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0]);
      return year >= 1990 && year <= new Date().getFullYear() + 1 ? year : undefined;
    }
    return undefined;
  }

  /**
   * Extrae el kilometraje del texto
   */
  private extractMileage(text: string): number | undefined {
    const mileageMatch = text.match(/(\d+(?:\.\d+)?)\s*km/i);
    if (mileageMatch) {
      return parseInt(mileageMatch[1].replace('.', ''));
    }
    return undefined;
  }

  /**
   * Calcula el rango de precios
   */
  private calculatePriceRange(listings: TuCarroListing[]): {
    min: number;
    max: number;
    average: number;
  } {
    const prices = listings.map(l => l.price).filter(p => p > 0);
    
    if (prices.length === 0) {
      return { min: 0, max: 0, average: 0 };
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    return { min, max, average };
  }

  /**
   * Verifica si el scraper está funcionando
   */
  async healthCheck(): Promise<boolean> {
    try {
      const allowed = await this.isAllowedByRobotsTxt(this.baseURL, '/');
      return allowed;
    } catch {
      return false;
    }
  }
}

// Exportar instancia singleton
export const tuCarroScraper = new TuCarroScraper();
