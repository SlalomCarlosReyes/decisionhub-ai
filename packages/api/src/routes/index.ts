import { Router } from 'express';
import healthRoutes from './health';
import carRoutes from './cars';

const router = Router();

// Mount route handlers
router.use('/health', healthRoutes);
router.use('/cars', carRoutes);

export default router;
