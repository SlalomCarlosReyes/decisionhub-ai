import { Router } from 'express';
import {
  getAllCars,
  getCarById,
  searchCars,
  getRecommendations,
  compareCars,
  getNaturalLanguageRecommendations,
} from '../controllers/carController';

const router = Router();

// Get all cars
router.get('/', getAllCars);

// Get car by ID
router.get('/:id', getCarById);

// Search cars
router.post('/search', searchCars);

// Get AI recommendations (natural language)
router.post('/recommend/nl', getNaturalLanguageRecommendations);

// Get AI recommendations (structured criteria)
router.post('/recommend', getRecommendations);

// Compare multiple cars
router.post('/compare', compareCars);

export default router;
