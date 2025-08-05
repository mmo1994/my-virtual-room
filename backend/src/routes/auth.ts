import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../utils/validation';
import { authRateLimit, passwordResetRateLimit } from '../middleware/rateLimiter';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes with rate limiting
router.post('/register', authRateLimit, validate(registerSchema), AuthController.register);
router.post('/login', authRateLimit, validate(loginSchema), AuthController.login);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/forgot-password', passwordResetRateLimit, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', passwordResetRateLimit, validate(resetPasswordSchema), AuthController.resetPassword);

// Protected routes
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', authenticateToken, AuthController.logout);
router.post('/change-password', authRateLimit, authenticateToken, validate(changePasswordSchema), AuthController.changePassword);
router.get('/me', authenticateToken, AuthController.getCurrentUser);

export default router; 