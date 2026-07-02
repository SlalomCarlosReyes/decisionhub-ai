/**
 * OLX Colombia Scraper
 * 
 * Web scraper para extraer precios de vehículos desde OLX Colombia
 * (olx.com.co) - marketplace de clasificados
 * 
 * IMPORTANTE: Respeta robots.txt y límites de rate limiting
 */

import * as cheerio from 'cheerio';
import { BaseScraper } from './baseScraper.js';
import { olxLimiter } from './rateLimiter.js';

export interface OLXListing {
  title: string;
  price: number; // En COP
  year?: number;
  mileage?: number; // En kilómetros
  location?: string;
  url: string;
  condition?: 'nuevo' | 'usado';
  publishedDate?: string;
}

export interface OLXSearchResult {
  available: boolean;
  listings: OLXListing[];
  priceRange?: {
    min: number;
    max: number;
    average: number;
  };
  count: number;
  source: 'olx';
  message?: string;
}

/**
 * Scraper para OLX Colombia
 * Extrae información de precios del marketplace colombiano
 */
export class OLXScraper extends BaseScraper {
  private readonly baseURL = 'https://www.olx.com.co';
  private readonly searchPath = '/autos-motos-y-otros';

  constructor() {
    super('OLX');
  }

  /**
   * Busca listados de un vehículo específico
   */
  async searchVehicle(
    make: string,
    model: string,
    year?: number
  ): Promise<OLXSearchResult> {
    try {
      console.log(`[OLX] Searching for ${make} ${model}${year ? ` ${year}` : ''}`);

      // Verificar robots.txt
      const allowed = await this.isAllowedByRobotsTxt(this.baseURL, this.searchPath);
      if (!allowed) {
        console.warn('[OLX] Blocked by robots.txt');
        return {
          available: false,
          listings: [],
          count: 0,
          source: 'olx',
          message: 'Blocked by robots.txt policy',
        };
      }

      // Usar rate limiter
      const result = await olxLimiter.schedule(async () => {
        return await this.fetchListings(make, model, year);
      });

      return result;
    } catch (error) {
      console.error('[OLX] Error scraping:', error);
      return {
        available: false,
        listings: [],
        count: 0,
        source: 'olx',
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
  ): Promise<OLXSearchResult> {
    try {
      // Construir URL de búsqueda
      const searchQuery = this.buildSearchQuery(make, model, year);
      const searchURL = `${this.baseURL}${this.searchPath}${searchQuery}`;

      console.log(`[OLX] Fetching: ${searchURL}`);

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
          source: 'olx',
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
          source: 'olx',
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
        source: 'olx',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Construye el query de búsqueda
   */
  private buildSearchQuery(make: string, model: string, year?: number): string {
    // OLX usa parámetro q para búsqueda
    const searchTerm = `${make} ${model}${year ? ` ${year}` : ''}`;
    return `?q=${encodeURIComponent(searchTerm)}`;
  }

  /**
   * Parsea los listados de la página HTML
   */
  private parseListings(html: string): OLXListing[] {
    const $ = cheerio.load(html);
    const listings: OLXListing[] = [];

    // Selectores de OLX (pueden variar)
    $('[data-aut-id="itemBox"]').each((_, element) => {
      try {
        const $el = $(element);
        
        // Extraer título
        const title = $el.find('[data-aut-id="itemTitle"]').text().trim();
        if (!title) return;

        // Extraer precio
        const priceText = $el.find('[data-aut-id="itemPrice"]').text().trim();
        const price = this.parsePrice(priceText);
        if (!price) return;

        // Extraer URL
        const url = $el.find('a').attr('href');
        if (!url) return;
        const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

        // Extraer ubicación
        const location = $el.find('[data-aut-id="item-location"]').text().trim() || undefined;

        // Extraer fecha de publicación
        const publishedDate = $el.find('[data-aut-id="item-date"]').text().trim() || undefined;

        // Extraer año y kilometraje del título
        const year = this.extractYear(title);
        const mileage = this.extractMileage(title);

        listings.push({
          title,
          price,
          year,
          mileage,
          location,
          url: fullURL,
          publishedDate,
        });
      } catch (error) {
        // Skip invalid listings
        console.warn('[OLX] Failed to parse listing:', error);
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
    const cleaned = priceText.replace(/[$\s.,]/g, '');
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
    // Buscar patrones como "50000 km" o "50.000 km"
    const mileageMatch = text.match(/(\d+(?:[.,]\d+)*)\s*km/i);
    if (mileageMatch) {
      const cleaned = mileageMatch[1].replace(/[.,]/g, '');
      return parseInt(cleaned);
    }
    return undefined;
  }

  /**
   * Calcula el rango de precios
   */
  private calculatePriceRange(listings: OLXListing[]): {
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
      const allowed = await this.isAllowedByRobotsTxt(this.baseURL, this.searchPath);
      return allowed;
    } catch {
      return false;
    }
  }
}

// Exportar instancia singleton
export const olxScraper = new OLXScraper();
