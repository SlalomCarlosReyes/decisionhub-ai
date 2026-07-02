/**
 * Unit Tests: Mercado Libre Client
 * 
 * Tests para el cliente de Mercado Libre API
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MercadoLibreClient } from './mercadoLibreClient.js';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('MercadoLibreClient', () => {
  let client: MercadoLibreClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize without credentials', () => {
      client = new MercadoLibreClient();
      expect(client.hasCredentials).toBe(false);
    });

    it('should initialize with credentials', () => {
      client = new MercadoLibreClient('test_app_id', 'test_secret');
      expect(client.hasCredentials).toBe(true);
    });
  });

  describe('searchVehicles', () => {
    beforeEach(() => {
      client = new MercadoLibreClient();
    });

    it('should search vehicles successfully without authentication', async () => {
      const mockSearchResponse = {
        data: {
          results: [
            {
              id: 'MCO123456',
              title: 'Honda Civic 2022',
              price: 85000000,
              currency_id: 'COP',
              condition: 'used',
              thumbnail: 'https://example.com/image.jpg',
              permalink: 'https://carro.mercadolibre.com.co/MCO-123456',
              seller: {
                id: 12345,
                nickname: 'VENDEDOR_PRO',
              },
              location: {
                city: { name: 'Bogotá' },
                state: { name: 'Cundinamarca' },
              },
              attributes: [
                { id: 'VEHICLE_YEAR', name: 'Año', value_name: '2022' },
                { id: 'KILOMETERS', name: 'Kilómetros', value_name: '15000' },
              ],
            },
          ],
          paging: {
            total: 1,
          },
        },
      };

      mockAxiosInstance.post.mockRejectedValue(new Error('No credentials'));
      mockAxiosInstance.get.mockResolvedValue(mockSearchResponse);

      const result = await client.searchVehicles('Honda', 'Civic', 2022);

      expect(result.available).toBe(true);
      expect(result.authenticated).toBe(false);
      expect(result.listings).toHaveLength(1);
      expect(result.listings[0].title).toBe('Honda Civic 2022');
      expect(result.listings[0].price).toBe(85000000);
    });

    it('should authenticate and search with credentials', async () => {
      const mockAuthResponse = {
        data: {
          access_token: 'test_token_123',
          token_type: 'Bearer',
          expires_in: 21600,
        },
      };

      const mockSearchResponse = {
        data: {
          results: [
            {
              id: 'MCO123456',
              title: 'Toyota Corolla 2023',
              price: 95000000,
              currency_id: 'COP',
              condition: 'new',
              thumbnail: 'https://example.com/image.jpg',
              permalink: 'https://carro.mercadolibre.com.co/MCO-123456',
            },
          ],
          paging: { total: 1 },
        },
      };

      const mockCredentialedInstance = {
        post: vi.fn().mockResolvedValue(mockAuthResponse),
        get: vi.fn().mockResolvedValue(mockSearchResponse),
      };

      mockedAxios.create.mockReturnValue(mockCredentialedInstance);

      const clientWithCreds = new MercadoLibreClient('test_app', 'test_secret');
      const result = await clientWithCreds.searchVehicles('Toyota', 'Corolla', 2023);

      expect(result.available).toBe(true);
      expect(result.authenticated).toBe(true);
      expect(result.listings).toHaveLength(1);
    });

    it('should handle no results found', async () => {
      const mockResponse = {
        data: {
          results: [],
          paging: { total: 0 },
        },
      };

      mockAxiosInstance.post.mockRejectedValue(new Error('No credentials'));
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.searchVehicles('Unknown', 'Model', 2022);

      expect(result.available).toBe(false);
      expect(result.message).toContain('No results found');
      expect(result.listings).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('No credentials'));
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const result = await client.searchVehicles('Honda', 'Civic', 2022);

      expect(result.available).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should calculate price range correctly', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 'MCO1',
              title: 'Car 1',
              price: 50000000,
              currency_id: 'COP',
              condition: 'used',
              thumbnail: 'img1.jpg',
              permalink: 'link1',
            },
            {
              id: 'MCO2',
              title: 'Car 2',
              price: 75000000,
              currency_id: 'COP',
              condition: 'used',
              thumbnail: 'img2.jpg',
              permalink: 'link2',
            },
            {
              id: 'MCO3',
              title: 'Car 3',
              price: 100000000,
              currency_id: 'COP',
              condition: 'used',
              thumbnail: 'img3.jpg',
              permalink: 'link3',
            },
          ],
          paging: { total: 3 },
        },
      };

      mockAxiosInstance.post.mockRejectedValue(new Error('No credentials'));
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.searchVehicles('Honda', 'Civic');

      expect(result.priceRange).toBeDefined();
      expect(result.priceRange?.min).toBe(50000000);
      expect(result.priceRange?.max).toBe(100000000);
      expect(result.priceRange?.average).toBe(75000000);
    });
  });

  describe('getItemDetails', () => {
    beforeEach(() => {
      client = new MercadoLibreClient();
    });

    it('should fetch item details successfully', async () => {
      const mockResponse = {
        data: {
          id: 'MCO123456',
          title: 'Honda Civic 2022',
          price: 85000000,
          currency_id: 'COP',
          condition: 'used',
          thumbnail: 'https://example.com/image.jpg',
          permalink: 'https://carro.mercadolibre.com.co/MCO-123456',
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const item = await client.getItemDetails('MCO123456');

      expect(item).toBeDefined();
      expect(item?.id).toBe('MCO123456');
      expect(item?.title).toBe('Honda Civic 2022');
    });

    it('should return null on error', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Not found'));

      const item = await client.getItemDetails('INVALID_ID');

      expect(item).toBeNull();
    });
  });

  describe('healthCheck', () => {
    beforeEach(() => {
      client = new MercadoLibreClient();
    });

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
});
