import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { updateProfileSchema } from '../utils/validation';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

// Profile management
router.get('/profile', UserController.getProfile);
router.put('/profile', validate(updateProfileSchema), UserController.updateProfile);
router.delete('/account', UserController.deleteAccount);

// User projects
router.get('/projects', UserController.getUserProjects);

export default router; 