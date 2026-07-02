import { Request, Response, NextFunction } from 'express';
import {
  CarSearchCriteria,
  ApiResponse,
  validateCarSearchCriteria,
  NaturalLanguageRequest,
} from '@decisionhub/shared';
import * as carService from '../services/carService';

export async function getAllCars(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cars = await carService.getAllCars();
    res.json({
      success: true,
      data: cars,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
}

export async function getCarById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const car = await carService.getCarById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Car with ID ${id} not found`,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: car,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
}

export async function searchCars(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const criteria: CarSearchCriteria = req.body;

    // Validate criteria
    const validation = validateCarSearchCriteria(criteria);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid search criteria',
          details: validation.errors,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    const cars = await carService.searchCars(criteria);
    res.json({
      success: true,
      data: cars,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
}

export async function getRecommendations(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const criteria: CarSearchCriteria = req.body;

    // Validate criteria
    const validation = validateCarSearchCriteria(criteria);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid search criteria',
          details: validation.errors,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    const recommendations = await carService.getRecommendations(criteria);
    res.json({
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
}

export async function compareCars(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { carIds } = req.body;

    if (!Array.isArray(carIds) || carIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least 2 car IDs are required for comparison',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    const comparison = await carService.compareCars(carIds);
    res.json({
      success: true,
      data: comparison,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
}

export async function getNaturalLanguageRecommendations(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { query, currency = 'COP' }: NaturalLanguageRequest = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query is required and must be a non-empty string',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    const result = await carService.getNaturalLanguageRecommendations({
      query: query.trim(),
      currency,
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
}
