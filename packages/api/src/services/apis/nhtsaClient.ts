/**
 * NHTSA API Client
 * 
 * Cliente para la API pública de la National Highway Traffic Safety Administration (NHTSA)
 * Proporciona datos de seguridad vehicular sin necesidad de autenticación.
 * 
 * API Documentation: https://vpic.nhtsa.dot.gov/api/
 * Safety Ratings: https://api.nhtsa.gov/SafetyRatings
 */

import axios, { AxiosInstance } from 'axios';
import { BaseScraper } from '../scraping/baseScraper.js';
import { nhtsaLimiter } from '../scraping/rateLimiter.js';

export interface NHTSASafetyRating {
  vehicleId: number;
  make: string;
  model: string;
  year: number;
  overallRating: number; // 1-5 stars
  overallFrontCrashRating?: number;
  frontCrashDriversideRating?: number;
  frontCrashPassengersideRating?: number;
  overallSideCrashRating?: number;
  sideCrashDriversideRating?: number;
  sideCrashPassengersideRating?: number;
  rolloverRating?: number;
  rolloverRating2?: number;
  sideBarrierRating?: number;
  complaintCount?: number;
  recallCount?: number;
  investigationCount?: number;
}

export interface NHTSAVehicleInfo {
  makeId: number;
  makeName: string;
  modelId: number;
  modelName: string;
  year: number;
}

export interface NHTSASearchResult {
  available: boolean;
  data?: NHTSASafetyRating;
  message?: string;
  source: 'nhtsa';
}

/**
 * Cliente para la API de NHTSA
 * Proporciona información de seguridad vehicular de fuentes oficiales
 */
export class NHTSAClient extends BaseScraper {
  private readonly baseURL = 'https://api.nhtsa.gov';
  private apiClient: AxiosInstance;

  constructor() {
    super('NHTSA');
    
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
   * Busca calificaciones de seguridad para un vehículo específico
   */
  async getSafetyRatings(
    make: string,
    model: string,
    year: number
  ): Promise<NHTSASearchResult> {
    try {
      console.log(`[NHTSA] Searching safety ratings for ${year} ${make} ${model}`);

      // Usar el rate limiter configurado
      const result = await nhtsaLimiter.schedule(async () => {
        return await this.fetchSafetyRatings(make, model, year);
      });

      return result;
    } catch (error) {
      console.error('[NHTSA] Error fetching safety ratings:', error);
      return {
        available: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        source: 'nhtsa',
      };
    }
  }

  /**
   * Obtiene las calificaciones de seguridad de la API
   */
  private async fetchSafetyRatings(
    make: string,
    model: string,
    year: number
  ): Promise<NHTSASearchResult> {
    try {
      // Endpoint: /api/v1/SafetyRatings/modelyear/{year}/make/{make}/model/{model}
      const url = `/api/v1/SafetyRatings/modelyear/${year}/make/${encodeURIComponent(make)}/model/${encodeURIComponent(model)}`;
      
      const response = await this.apiClient.get(url);

      if (!response.data || !response.data.Results || response.data.Results.length === 0) {
        return {
          available: false,
          message: 'No safety ratings found for this vehicle',
          source: 'nhtsa',
        };
      }

      // La API puede devolver múltiples resultados si hay diferentes configuraciones
      // Tomamos el primero con la calificación más completa
      const result = this.selectBestResult(response.data.Results);

      return {
        available: true,
        data: this.parseNHTSAResult(result),
        source: 'nhtsa',
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          available: false,
          message: 'Vehicle not found in NHTSA database',
          source: 'nhtsa',
        };
      }
      
      throw error;
    }
  }

  /**
   * Selecciona el mejor resultado cuando hay múltiples configuraciones
   */
  private selectBestResult(results: any[]): any {
    // Priorizar resultados con más información de crash tests
    return results.reduce((best, current) => {
      const bestScore = (best.OverallFrontCrashRating || 0) + 
                       (best.OverallSideCrashRating || 0) + 
                       (best.RolloverRating || 0);
      const currentScore = (current.OverallFrontCrashRating || 0) + 
                          (current.OverallSideCrashRating || 0) + 
                          (current.RolloverRating || 0);
      
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Parsea la respuesta de NHTSA a nuestro formato
   */
  private parseNHTSAResult(result: any): NHTSASafetyRating {
    return {
      vehicleId: result.VehicleId || 0,
      make: result.Make || '',
      model: result.Model || '',
      year: result.ModelYear || 0,
      overallRating: parseInt(result.OverallRating) || 0,
      overallFrontCrashRating: this.parseRating(result.OverallFrontCrashRating),
      frontCrashDriversideRating: this.parseRating(result.FrontCrashDriversideRating),
      frontCrashPassengersideRating: this.parseRating(result.FrontCrashPassengersideRating),
      overallSideCrashRating: this.parseRating(result.OverallSideCrashRating),
      sideCrashDriversideRating: this.parseRating(result.SideCrashDriversideRating),
      sideCrashPassengersideRating: this.parseRating(result.SideCrashPassengersideRating),
      rolloverRating: this.parseRating(result.RolloverRating),
      rolloverRating2: this.parseRating(result.RolloverRating2),
      sideBarrierRating: this.parseRating(result.SideBarrierRating),
      complaintCount: parseInt(result.ComplaintCount) || 0,
      recallCount: parseInt(result.RecallCount) || 0,
      investigationCount: parseInt(result.InvestigationCount) || 0,
    };
  }

  /**
   * Convierte una calificación string a número
   */
  private parseRating(rating: any): number | undefined {
    if (!rating || rating === 'Not Rated') return undefined;
    const parsed = parseInt(rating);
    return isNaN(parsed) ? undefined : parsed;
  }

  /**
   * Busca modelos disponibles para una marca y año
   */
  async getModelsForMake(make: string, year: number): Promise<NHTSAVehicleInfo[]> {
    try {
      const url = `/api/v1/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
      
      const response = await nhtsaLimiter.schedule(async () => {
        return await this.apiClient.get(url);
      });

      if (!response.data || !response.data.Results) {
        return [];
      }

      return response.data.Results.map((result: any) => ({
        makeId: result.Make_ID,
        makeName: result.Make_Name,
        modelId: result.Model_ID,
        modelName: result.Model_Name,
        year: year,
      }));
    } catch (error) {
      console.error('[NHTSA] Error fetching models:', error);
      return [];
    }
  }

  /**
   * Verifica si la API está disponible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.apiClient.get('/api/v1/SafetyRatings', {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// Exportar instancia singleton
export const nhtsaClient = new NHTSAClient();
