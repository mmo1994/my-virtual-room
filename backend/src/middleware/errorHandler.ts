import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { ApiResponse } from '../types';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errorCode: string | undefined;

  constructor(message: string, statusCode: number = 500, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errorCode = errorCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async wrapper to catch errors
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// Development error response
const sendErrorDev = (err: AppError, res: Response): void => {
  const response: any = {
    success: false,
    message: err.message,
    error: err.errorCode || 'INTERNAL_ERROR',
    stack: err.stack,
    details: {
      statusCode: err.statusCode,
      isOperational: err.isOperational
    }
  };

  res.status(err.statusCode).json(response);
};

// Production error response
const sendErrorProd = (err: AppError, res: Response): void => {
  // Only send operational errors to client in production
  if (err.isOperational) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
      error: err.errorCode || 'OPERATIONAL_ERROR'
    };

    res.status(err.statusCode).json(response);
  } else {
    // Log the error for debugging
    logger.error('Non-operational error:', err);

    // Send generic error message
    const response: ApiResponse = {
      success: false,
      message: 'Something went wrong!',
      error: 'INTERNAL_ERROR'
    };

    res.status(500).json(response);
  }
};

// Handle database connection errors
const handleDatabaseError = (err: any): AppError => {
  if (err.code === 'ECONNREFUSED') {
    return new AppError('Database connection failed', 503, 'DATABASE_CONNECTION_ERROR');
  }
  
  if (err.code === '23505') { // Unique constraint violation
    return new AppError('Duplicate entry found', 409, 'DUPLICATE_ENTRY');
  }
  
  if (err.code === '23503') { // Foreign key constraint violation
    return new AppError('Referenced record not found', 400, 'FOREIGN_KEY_VIOLATION');
  }
  
  if (err.code === '23502') { // Not null constraint violation
    return new AppError('Required field is missing', 400, 'REQUIRED_FIELD_MISSING');
  }

  return new AppError('Database operation failed', 500, 'DATABASE_ERROR');
};

// Handle JWT errors
const handleJWTError = (): AppError => {
  return new AppError('Invalid token. Please log in again!', 401, 'INVALID_TOKEN');
};

// Handle JWT expired error
const handleJWTExpiredError = (): AppError => {
  return new AppError('Your token has expired! Please log in again.', 401, 'TOKEN_EXPIRED');
};

// Handle validation errors
const handleValidationError = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

// Handle cast errors (invalid ObjectId, etc.)
const handleCastError = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, 'INVALID_DATA');
};

// Global error handling middleware
export const globalErrorHandler = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error details
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code && typeof err.code === 'string') error = handleDatabaseError(err);

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// 404 error handler
export const handleNotFound = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`,
    error: 'NOT_FOUND'
  };

  res.status(404).json(response);
}; 