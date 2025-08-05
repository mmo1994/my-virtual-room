import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { query } from '../config/database';
import { logger } from '../config/logger';

// Extend Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        emailVerified: boolean;
      };
    }
  }
}

// Extract token from Authorization header
const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

// Middleware to authenticate JWT tokens
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
      return;
    }

    // Verify the token
    const payload = verifyToken(token, process.env.JWT_SECRET!);
    
    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
      return;
    }

    // Check if user still exists
    const userResult = await query(
      'SELECT id, email, first_name, last_name, email_verified FROM users WHERE id = $1',
      [payload.userId]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const user = userResult.rows[0];

    // Add user info to request
    req.userId = payload.userId;
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      emailVerified: user.email_verified
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to verify email is confirmed
// TODO: TEMPORARY - Email verification disabled for development
export const requireEmailVerification = async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // TEMPORARY: Skip email verification check
    // if (!req.user?.emailVerified) {
    //   res.status(403).json({
    //     success: false,
    //     message: 'Please verify your email address before accessing this resource'
    //   });
    //   return;
    // }

    next();
  } catch (error) {
    logger.error('Email verification check error:', error);
    _res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const payload = verifyToken(token, process.env.JWT_SECRET!);
      
      if (payload) {
        // Check if user still exists
        const userResult = await query(
          'SELECT id, email, first_name, last_name, email_verified FROM users WHERE id = $1',
          [payload.userId]
        );

        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          req.userId = payload.userId;
          req.user = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            emailVerified: user.email_verified
          };
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    // Don't fail the request, just continue without auth
    next();
  }
}; 