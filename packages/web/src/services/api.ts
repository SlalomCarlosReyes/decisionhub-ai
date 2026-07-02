import {
  Car,
  CarSearchCriteria,
  CarRecommendation,
  ApiResponse,
  AIRecommendationResponse,
  Currency,
} from '@decisionhub/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse<T> = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data.data as T;
}

export async function getAllCars(): Promise<Car[]> {
  return fetchJSON<Car[]>('/cars');
}

export async function getCarById(id: string): Promise<Car> {
  return fetchJSON<Car>(`/cars/${id}`);
}

export async function searchCars(criteria: CarSearchCriteria): Promise<Car[]> {
  return fetchJSON<Car[]>('/cars/search', {
    method: 'POST',
    body: JSON.stringify(criteria),
  });
}

export async function getRecommendations(criteria: CarSearchCriteria): Promise<CarRecommendation[]> {
  return fetchJSON<CarRecommendation[]>('/cars/recommend', {
    method: 'POST',
    body: JSON.stringify(criteria),
  });
}

export async function compareCars(carIds: string[]): Promise<any> {
  return fetchJSON('/cars/compare', {
    method: 'POST',
    body: JSON.stringify({ carIds }),
  });
}

export async function getNaturalLanguageRecommendations(
  query: string,
  currency: Currency = 'COP'
): Promise<AIRecommendationResponse> {
  return fetchJSON<AIRecommendationResponse>('/cars/recommend/nl', {
    method: 'POST',
    body: JSON.stringify({ query, currency }),
  });
}

export async function checkHealth(): Promise<any> {
  return fetchJSON('/health');
}
