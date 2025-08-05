import Joi from 'joi';

// User validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(100).required(),
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required',
    'string.empty': 'Reset token cannot be empty'
  }),
  password: Joi.string().min(8).required().messages({
    'any.required': 'New password is required',
    'string.empty': 'New password cannot be empty',
    'string.min': 'New password must be at least 8 characters long'
  })
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
    'string.empty': 'Current password cannot be empty'
  }),
  newPassword: Joi.string().min(8).required().messages({
    'any.required': 'New password is required',
    'string.empty': 'New password cannot be empty',
    'string.min': 'New password must be at least 8 characters long'
  })
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  email: Joi.string().email().optional()
});

// Project validation schemas
export const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  styleDescription: Joi.string().min(1).max(200).required()
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  styleDescription: Joi.string().min(1).max(200).optional()
});

// Furniture validation schemas
export const furnitureFiltersSchema = Joi.object({
  category: Joi.string().optional(),
  style: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  search: Joi.string().max(100).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('name', 'price', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const addFurnitureToProjectSchema = Joi.object({
  furnitureId: Joi.string().uuid().required(),
  positionX: Joi.number().integer().required(),
  positionY: Joi.number().integer().required(),
  scale: Joi.number().min(0.1).max(5).default(1),
  rotation: Joi.number().min(0).max(360).default(0)
});

// File upload validation
export const fileUploadSchema = Joi.object({
  maxSize: Joi.number().max(15 * 1024 * 1024), // 15MB
  allowedTypes: Joi.array().items(
    Joi.string().valid('image/jpeg', 'image/png', 'image/webp', 'image/heic')
  )
});

// Analytics validation
export const analyticsEventSchema = Joi.object({
  eventType: Joi.string().required(),
  eventData: Joi.object().optional(),
  furnitureId: Joi.string().uuid().optional()
});

// Pagination validation
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// UUID validation
export const uuidSchema = Joi.string().uuid().required();

// Email validation
export const emailSchema = Joi.string().email().required();

// Common validation helper functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 100) {
    errors.push('Password must be less than 100 characters');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateImageFile = (file: Express.Multer.File): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  const maxSize = 15 * 1024 * 1024; // 15MB
  
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('Invalid file type. Only JPEG, PNG, WebP, and HEIC files are allowed');
  }
  
  if (file.size > maxSize) {
    errors.push('File size too large. Maximum size is 15MB');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitization helpers
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Furniture generation validation schema
export const generateFurnitureVisualizationSchema = Joi.object({
  styleDescription: Joi.string().min(3).max(500).required().messages({
    'any.required': 'Style description is required',
    'string.empty': 'Style description cannot be empty',
    'string.min': 'Style description must be at least 3 characters long',
    'string.max': 'Style description must be less than 500 characters'
  }),
  furnitureItems: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      image: Joi.string().required()
    })
  ).min(1).max(10).required().messages({
    'any.required': 'Furniture items are required',
    'array.min': 'At least one furniture item must be selected',
    'array.max': 'Maximum 10 furniture items can be selected'
  })
}); 