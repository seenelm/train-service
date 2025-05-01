import { Router } from 'express';
import userRoutes from './user.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

// Mount routes
router.use('/users', userRoutes);
router.use('/health', healthRoutes);
export default router; 