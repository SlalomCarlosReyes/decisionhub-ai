import {
  Car,
  CarSearchCriteria,
  CarRecommendation,
  CarComparison,
  NaturalLanguageRequest,
  AIRecommendationResponse,
} from '@decisionhub/shared';
import { loadCarsData, getCarById as getCarFromData } from '../data/mockData';
import { CarRecommendationAgent } from '../agents/CarRecommendationAgent';
import { CarComparisonAgent } from '../agents/CarComparisonAgent';
import { NaturalLanguageRecommendationAgent } from '../agents/NaturalLanguageRecommendationAgent';

const recommendationAgent = new CarRecommendationAgent();
const comparisonAgent = new CarComparisonAgent();
const nlRecommendationAgent = new NaturalLanguageRecommendationAgent();

export async function getAllCars(): Promise<Car[]> {
  return loadCarsData();
}

export async function getCarById(id: string): Promise<Car | undefined> {
  return getCarFromData(id);
}

export async function searchCars(
  criteria: CarSearchCriteria
): Promise<Car[]> {
  const allCars = await loadCarsData();

  return allCars.filter((car) => {
    // Filter by price
    if (criteria.minPrice !== undefined && car.price < criteria.minPrice) {
      return false;
    }
    if (criteria.maxPrice !== undefined && car.price > criteria.maxPrice) {
      return false;
    }

    // Filter by year
    if (criteria.minYear !== undefined && car.year < criteria.minYear) {
      return false;
    }
    if (criteria.maxYear !== undefined && car.year > criteria.maxYear) {
      return false;
    }

    // Filter by fuel type
    if (
      criteria.fuelTypes &&
      criteria.fuelTypes.length > 0 &&
      !criteria.fuelTypes.includes(car.fuelType)
    ) {
      return false;
    }

    // Filter by body type
    if (
      criteria.bodyTypes &&
      criteria.bodyTypes.length > 0 &&
      car.bodyType &&
      !criteria.bodyTypes.includes(car.bodyType)
    ) {
      return false;
    }

    // Filter by drivetrain
    if (
      criteria.drivetrains &&
      criteria.drivetrains.length > 0 &&
      car.drivetrain &&
      !criteria.drivetrains.includes(car.drivetrain)
    ) {
      return false;
    }

    return true;
  });
}

export async function getRecommendations(
  criteria: CarSearchCriteria
): Promise<CarRecommendation[]> {
  // Use the AI agent (mock) to get recommendations
  const result = await recommendationAgent.execute(criteria);
  return result.recommendations;
}

export async function compareCars(carIds: string[]): Promise<CarComparison> {
  // Use the comparison agent (mock) to compare cars
  const result = await comparisonAgent.execute({ carIds });
  return result.comparison;
}

export async function getNaturalLanguageRecommendations(
  request: NaturalLanguageRequest
): Promise<AIRecommendationResponse> {
  // Use the natural language recommendation agent
  return nlRecommendationAgent.execute(request);
}
