/**
 * Unit Tests: NHTSA Client
 * 
 * Tests para el cliente de la API pública de NHTSA
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NHTSAClient } from './nhtsaClient.js';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('NHTSAClient', () => {
  let client: NHTSAClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock axios instance
    mockAxiosInstance = {
      get: vi.fn(),
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    client = new NHTSAClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getSafetyRatings', () => {
    it('should fetch safety ratings successfully', async () => {
      const mockResponse = {
        data: {
          Count: 1,
          Results: [
            {
              VehicleId: 12345,
              Make: 'Honda',
              Model: 'Civic',
              ModelYear: 2022,
              OverallRating: '5',
              OverallFrontCrashRating: '5',
              FrontCrashDriversideRating: '5',
              FrontCrashPassengersideRating: '5',
              OverallSideCrashRating: '5',
              RolloverRating: '4',
              ComplaintCount: '10',
              RecallCount: '2',
              InvestigationCount: '0',
            },
          ],
        },
        status: 200,
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getSafetyRatings('Honda', 'Civic', 2022);

      expect(result.available).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.make).toBe('Honda');
      expect(result.data?.model).toBe('Civic');
      expect(result.data?.overallRating).toBe(5);
    });

    it('should handle vehicle not found', async () => {
      const mockResponse = {
        data: {
          Count: 0,
          Results: [],
        },
        status: 200,
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getSafetyRatings('Unknown', 'Model', 2022);

      expect(result.available).toBe(false);
      expect(result.message).toContain('No safety ratings found');
    });

    it('should handle API errors gracefully', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const result = await client.getSafetyRatings('Honda', 'Civic', 2022);

      expect(result.available).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should handle 404 errors', async () => {
      const error: any = new Error('Not found');
      error.response = { status: 404 };

      mockAxiosInstance.get.mockRejectedValue(error);

      const result = await client.getSafetyRatings('Honda', 'Civic', 2022);

      expect(result.available).toBe(false);
      expect(result.message).toContain('not found in NHTSA database');
    });
  });

  describe('getModelsForMake', () => {
    it('should fetch models for a make and year', async () => {
      const mockResponse = {
        data: {
          Results: [
            {
              Make_ID: 474,
              Make_Name: 'Honda',
              Model_ID: 1861,
              Model_Name: 'Civic',
            },
            {
              Make_ID: 474,
              Make_Name: 'Honda',
              Model_ID: 1862,
              Model_Name: 'Accord',
            },
          ],
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const models = await client.getModelsForMake('Honda', 2022);

      expect(models).toHaveLength(2);
      expect(models[0].modelName).toBe('Civic');
      expect(models[1].modelName).toBe('Accord');
    });

    it('should return empty array on error', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('API error'));

      const models = await client.getModelsForMake('Honda', 2022);

      expect(models).toEqual([]);
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is available', async () => {
      mockAxiosInstance.get.mockResolvedValue({ status: 200 });

      const isHealthy = await client.healthCheck();

      expect(isHealthy).toBe(true);
    });

    it('should return false when API is unavailable', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Timeout'));

      const isHealthy = await client.healthCheck();

      expect(isHealthy).toBe(false);
    });
  });

  describe('Rating Parsing', () => {
    it('should parse ratings correctly', async () => {
      const mockResponse = {
        data: {
          Results: [
            {
              VehicleId: 12345,
              Make: 'Toyota',
              Model: 'Camry',
              ModelYear: 2023,
              OverallRating: '5',
              OverallFrontCrashRating: 'Not Rated',
              RolloverRating: '4',
            },
          ],
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getSafetyRatings('Toyota', 'Camry', 2023);

      expect(result.data?.overallRating).toBe(5);
      expect(result.data?.overallFrontCrashRating).toBeUndefined();
      expect(result.data?.rolloverRating).toBe(4);
    });
  });
});
