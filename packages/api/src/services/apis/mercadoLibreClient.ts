/**
 * Mercado Libre API Client
 * 
 * Cliente para la API de Mercado Libre Colombia
 * Busca precios de vehículos en el marketplace más grande de Latinoamérica
 * 
 * IMPORTANTE: Funciona con o sin credenciales
 * - Sin credenciales: Búsquedas públicas limitadas
 * - Con credenciales: Mayor cuota de requests y acceso completo
 * 
 * API Documentation: https://developers.mercadolibre.com/
 */

import axios, { AxiosInstance } from 'axios';
import { BaseScraper } from '../scraping/baseScraper.js';
import { mercadoLibreLimiter } from '../scraping/rateLimiter.js';

export interface MercadoLibreListing {
  id: string;
  title: string;
  price: number; // En COP
  currency: string;
  condition: 'new' | 'used';
  thumbnail: string;
  permalink: string;
  seller?: {
    id: number;
    nickname: string;
  };
  location?: {
    city: string;
    state: string;
  };
  attributes?: Array<{
    id: string;
    name: string;
    value_name: string;
  }>;
}

export interface MercadoLibreSearchResult {
  available: boolean;
  listings: MercadoLibreListing[];
  priceRange?: {
    min: number;
    max: number;
    average: number;
  };
  count: number;
  totalResults: number;
  source: 'mercadolibre';
  message?: string;
  authenticated: boolean;
}

/**
 * Cliente para Mercado Libre API
 * Funciona con o sin autenticación
 */
export class MercadoLibreClient extends BaseScraper {
  private readonly baseURL = 'https://api.mercadolibre.com';
  private readonly siteId = 'MCO'; // Colombia
  private apiClient: AxiosInstance;
  private appId?: string;
  private secretKey?: string;
  private accessToken?: string;

  constructor(appId?: string, secretKey?: string) {
    super('MercadoLibre');
    
    this.appId = appId || process.env.MERCADOLIBRE_APP_ID;
    this.secretKey = secretKey || process.env.MERCADOLIBRE_SECRET_KEY;

    this.apiClient = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': this.userAgent,
      },
    });
  }

  /**
   * Verifica si hay credenciales configuradas
   */
  get hasCredentials(): boolean {
    return !!(this.appId && this.secretKey);
  }

  /**
   * Obtiene access token si hay credenciales
   */
  private async authenticate(): Promise<boolean> {
    if (!this.hasCredentials) {
      console.log('[MercadoLibre] No credentials configured, using public API');
      return false;
    }

    try {
      const response = await this.apiClient.post('/oauth/token', {
        grant_type: 'client_credentials',
        client_id: this.appId,
        client_secret: this.secretKey,
      });

      this.accessToken = response.data.access_token;
      console.log('[MercadoLibre] Authenticated successfully');
      return true;
    } catch (error) {
      console.error('[MercadoLibre] Authentication failed:', error);
      return false;
    }
  }

  /**
   * Busca vehículos en Mercado Libre
   */
  async searchVehicles(
    make: string,
    model: string,
    year?: number
  ): Promise<MercadoLibreSearchResult> {
    try {
      console.log(`[MercadoLibre] Searching for ${make} ${model}${year ? ` ${year}` : ''}`);

      // Intentar autenticar si hay credenciales
      const authenticated = await this.authenticate();

      // Usar rate limiter
      const result = await mercadoLibreLimiter.schedule(async () => {
        return await this.fetchListings(make, model, year, authenticated);
      });

      return result;
    } catch (error) {
      console.error('[MercadoLibre] Error searching:', error);
      return {
        available: false,
        listings: [],
        count: 0,
        totalResults: 0,
        source: 'mercadolibre',
        authenticated: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Obtiene los listados de la API
   */
  private async fetchListings(
    make: string,
    model: string,
    year: number | undefined,
    authenticated: boolean
  ): Promise<MercadoLibreSearchResult> {
    try {
      // Construir query de búsqueda
      const query = this.buildSearchQuery(make, model, year);
      
      // Endpoint de búsqueda
      const url = `/sites/${this.siteId}/search`;
      
      const params: any = {
        q: query,
        category: 'MCO1744', // Categoría de Carros, Motos y Otros
        limit: 50, // Máximo resultados por página
      };

      // Agregar token si está autenticado
      const headers: any = {};
      if (authenticated && this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      console.log(`[MercadoLibre] Fetching: ${url}?q=${query}`);

      const response = await this.apiClient.get(url, { params, headers });

      if (!response.data || !response.data.results || response.data.results.length === 0) {
        return {
          available: false,
          listings: [],
          count: 0,
          totalResults: 0,
          source: 'mercadolibre',
          authenticated,
          message: 'No results found',
        };
      }

      // Parsear resultados
      const listings = this.parseListings(response.data.results);
      const priceRange = this.calculatePriceRange(listings);

      return {
        available: true,
        listings,
        priceRange,
        count: listings.length,
        totalResults: response.data.paging?.total || listings.length,
        source: 'mercadolibre',
        authenticated,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        return {
          available: false,
          listings: [],
          count: 0,
          totalResults: 0,
          source: 'mercadolibre',
          authenticated: false,
          message: 'Authentication failed',
        };
      }
      
      throw error;
    }
  }

  /**
   * Construye el query de búsqueda
   */
  private buildSearchQuery(make: string, model: string, year?: number): string {
    let query = `${make} ${model}`;
    
    if (year) {
      query += ` ${year}`;
    }
    
    return query;
  }

  /**
   * Parsea los resultados de la API
   */
  private parseListings(results: any[]): MercadoLibreListing[] {
    return results.map((item: any) => {
      // Extraer atributos útiles
      const yearAttr = item.attributes?.find((a: any) => a.id === 'VEHICLE_YEAR');
      const mileageAttr = item.attributes?.find((a: any) => a.id === 'KILOMETERS');

      return {
        id: item.id,
        title: item.title,
        price: item.price,
        currency: item.currency_id,
        condition: item.condition,
        thumbnail: item.thumbnail,
        permalink: item.permalink,
        seller: item.seller ? {
          id: item.seller.id,
          nickname: item.seller.nickname,
        } : undefined,
        location: item.location ? {
          city: item.location.city?.name || '',
          state: item.location.state?.name || '',
        } : undefined,
        attributes: item.attributes || [],
      };
    });
  }

  /**
   * Calcula el rango de precios
   */
  private calculatePriceRange(listings: MercadoLibreListing[]): {
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
   * Obtiene detalles de un listado específico
   */
  async getItemDetails(itemId: string): Promise<MercadoLibreListing | null> {
    try {
      const headers: any = {};
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      const response = await mercadoLibreLimiter.schedule(async () => {
        return await this.apiClient.get(`/items/${itemId}`, { headers });
      });

      if (!response.data) return null;

      const [listing] = this.parseListings([response.data]);
      return listing;
    } catch (error) {
      console.error('[MercadoLibre] Error fetching item details:', error);
      return null;
    }
  }

  /**
   * Verifica si la API está disponible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.apiClient.get(`/sites/${this.siteId}`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// Exportar instancia singleton
export const mercadoLibreClient = new MercadoLibreClient();
