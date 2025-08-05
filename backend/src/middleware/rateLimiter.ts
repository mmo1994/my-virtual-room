import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/environment';
import { logger } from '../config/logger';
import { ApiResponse } from '../types';

// Default rate limiter
export const defaultRateLimit = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });

    const response: ApiResponse = {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      error: 'RATE_LIMIT_EXCEEDED'
    };

    res.status(429).json(response);
  }
});

// Strict rate limiter for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    error: 'AUTH_RATE_LIMIT_EXCEEDED'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });

    const response: ApiResponse = {
      success: false,
      message: 'Too many authentication attempts, please try again later.',
      error: 'AUTH_RATE_LIMIT_EXCEEDED'
    };

    res.status(429).json(response);
  }
});

// File upload rate limiter
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
    error: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Upload rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });

    const response: ApiResponse = {
      success: false,
      message: 'Too many file uploads, please try again later.',
      error: 'UPLOAD_RATE_LIMIT_EXCEEDED'
    };

    res.status(429).json(response);
  }
});

// Password reset rate limiter
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.',
    error: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Password reset rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });

    const response: ApiResponse = {
      success: false,
      message: 'Too many password reset attempts, please try again later.',
      error: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
    };

    res.status(429).json(response);
  }
});

// Create custom rate limiter
export const createRateLimit = (options: {
  windowMs: number;
  max: number;
  message: string;
  errorCode: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      message: options.message,
      error: options.errorCode
    } as ApiResponse,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Custom rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        limitType: options.errorCode
      });

      const response: ApiResponse = {
        success: false,
        message: options.message,
        error: options.errorCode
      };

      res.status(429).json(response);
    }
  });
}; 