/**
 * Car-related type definitions
 */

import type { AgentTrace } from './agentTrace';

export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'plugin-hybrid';
export type BodyType = 'sedan' | 'suv' | 'truck' | 'coupe' | 'hatchback' | 'van';
export type Drivetrain = 'fwd' | 'rwd' | 'awd' | '4wd';
export type Transmission = 'manual' | 'automatic' | 'cvt' | 'dual-clutch';
export type Currency = 'COP' | 'USD' | 'EUR';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  fuelType: FuelType;
  bodyType?: BodyType;
  drivetrain?: Drivetrain;
  transmission?: Transmission;
  mpg?: {
    city: number;
    highway: number;
    combined: number;
  };
  features: string[];
  description?: string;
  imageUrl?: string;
  specifications?: {
    horsepower?: number;
    torque?: number;
    seating?: number;
    cargoSpace?: number;
  };
}

export interface CarSearchCriteria {
  minPrice?: number;
  maxPrice?: number;
  fuelTypes?: FuelType[];
  bodyTypes?: BodyType[];
  drivetrains?: Drivetrain[];
  minYear?: number;
  maxYear?: number;
  requiredFeatures?: string[];
  preferredFeatures?: string[];
  minMpg?: number;
}

export interface CarRecommendation {
  car: Car;
  score: number;
  reasoning: string;
  matchedFeatures: string[];
  pros: string[];
  cons: string[];
}

export interface CarComparison {
  cars: Car[];
  comparison: {
    attribute: string;
    values: (string | number | undefined)[];
    winner?: number; // index of the winning car for this attribute
  }[];
  recommendation?: string;
}

/**
 * Evaluation Result Types
 */

export interface EvaluationResult {
  vehicle: Car;
  finalScore: number;
  criteriaScores: Record<string, number>;
  rank: number;
}

/**
 * Natural Language Input & AI Analysis Types
 */

export interface NaturalLanguageRequest {
  query: string;
  currency?: Currency;
}

export interface AgentActivity {
  agentName: string;
  status: 'pending' | 'processing' | 'completed';
  description: string;
  timestamp?: string;
}

export interface DetectedPreference {
  label: string;
  value: string;
  confidence?: number;
}

export interface DecisionCriteria {
  name: string;
  weight: number;
  description?: string;
}

export interface AIAnalysis {
  category: string;
  budget?: {
    min?: number;
    max?: number;
    currency: Currency;
  };
  detectedPreferences: DetectedPreference[];
  decisionCriteria: DecisionCriteria[];
  searchCriteria: CarSearchCriteria;
  originalQuery: string;
}

export interface AIRecommendationResponse {
  analysis: AIAnalysis;
  recommendations: CarRecommendation[];
  agentActivity: AgentActivity[];
  processingTimeMs: number;
  agentTrace?: AgentTrace;
}

/**
 * Intent Analysis Types
 */

export interface IntentAnalysis {
  category?: string;        // Vehicle category (SUV, Sedan, etc.)
  budget?: {
    min?: number;
    max?: number;
    currency: Currency;
  };
  requirements: string[];   // Key requirements extracted
  queryType: 'recommendation' | 'comparison' | 'informational';
  confidence: number;       // 0.0-1.0
  rawQuery: string;
}
