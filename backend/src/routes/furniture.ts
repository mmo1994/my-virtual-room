import { Router } from 'express';
import { FurnitureController } from '../controllers/furnitureController';
import { optionalAuth } from '../middleware/auth';
import { validate, validateUuidParam } from '../middleware/validation';
import { furnitureFiltersSchema } from '../utils/validation';

const router = Router();

// Public furniture routes (with optional auth for personalization)
router.get('/', optionalAuth, validate(furnitureFiltersSchema, 'query'), FurnitureController.getFurniture);
router.get('/categories', optionalAuth, FurnitureController.getCategories);
router.get('/:id', optionalAuth, validateUuidParam('id'), FurnitureController.getFurnitureItem);

// Track affiliate clicks (with optional auth for analytics)
router.post('/:id/click', optionalAuth, validateUuidParam('id'), FurnitureController.trackAffiliateClick);

export default router; 