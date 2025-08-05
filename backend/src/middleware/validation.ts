import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types';
import { logger } from '../config/logger';

// Generic validation middleware factory
export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate = req[source];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation error:', {
        source,
        errors: validationErrors,
        data: dataToValidate
      });

      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        data: { errors: validationErrors }
      };

      res.status(400).json(response);
      return;
    }

    // Replace request data with validated and sanitized data
    req[source] = value;
    next();
  };
};

// Middleware to validate UUID parameters
export const validateUuidParam = (paramName: string) => {
  const uuidSchema = Joi.string().uuid().required();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    const { error } = uuidSchema.validate(value);

    if (error) {
      const response: ApiResponse = {
        success: false,
        message: `Invalid ${paramName} format`,
        error: 'INVALID_UUID'
      };
      res.status(400).json(response);
      return;
    }

    next();
  };
};

// Middleware to validate pagination parameters
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  });

  const { error, value } = paginationSchema.validate(req.query, {
    allowUnknown: true,
    stripUnknown: false
  });

  if (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid pagination parameters',
      error: 'INVALID_PAGINATION'
    };
    res.status(400).json(response);
    return;
  }

  // Merge validated pagination params back to query
  req.query = { ...req.query, ...value };
  next();
};

// Middleware for content type validation
export const validateContentType = (allowedTypes: string[] = ['application/json']) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      const response: ApiResponse = {
        success: false,
        message: `Invalid content type. Allowed types: ${allowedTypes.join(', ')}`,
        error: 'INVALID_CONTENT_TYPE'
      };
      res.status(415).json(response);
      return;
    }

    next();
  };
};

// Middleware to sanitize string inputs
export const sanitizeStrings = (req: Request, _res: Response, next: NextFunction): void => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value.trim().replace(/[<>]/g, '');
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  
  next();
}; 