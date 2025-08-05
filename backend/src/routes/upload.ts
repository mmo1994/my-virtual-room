import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/auth';
import { uploadRateLimit } from '../middleware/rateLimiter';

const router = Router();

// All upload routes require authentication and rate limiting
router.use(authenticateToken);
router.use(uploadRateLimit);

// File upload endpoints
router.post('/image', UploadController.uploadImage);
router.delete('/:filename', UploadController.deleteFile);

export default router; 