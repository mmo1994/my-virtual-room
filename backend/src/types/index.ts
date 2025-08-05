export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  googleId?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  styleDescription: string;
  originalImageUrl?: string;
  generatedImageUrl?: string;
  status: 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processingStartedAt?: Date;
  processingEndedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  styleDescription: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  styleDescription?: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  description: string;
  category: string;
  style: string;
  price: number;
  currency: string;
  imageUrl: string;
  retailerName: string;
  retailerUrl: string;
  affiliateUrl: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFurniture {
  id: string;
  projectId: string;
  furnitureId: string;
  positionX: number;
  positionY: number;
  scale: number;
  rotation: number;
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: User;
  userId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FurnitureFilters {
  category?: string;
  style?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface AnalyticsEvent {
  userId?: string;
  furnitureId?: string;
  eventType: string;
  eventData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  sessionId?: string;
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
}

export interface AIRequest {
  imageUrl: string;
  styleDescription: string;
  furnitureItems: string[];
}

export interface AIResponse {
  success: boolean;
  generatedImageUrl?: string;
  processedFurniture?: Array<{
    furnitureId: string;
    positionX: number;
    positionY: number;
    scale: number;
    rotation: number;
  }>;
  error?: string;
}

// Request types for Express
export interface Request extends Express.Request {
  user?: User;
  userId?: string;
}

// Environment variables interface
export interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  PORT: number;
  NODE_ENV: string;
  CORS_ORIGIN: string;
  EMAIL_PROVIDER: string;
  SENDGRID_API_KEY: string | undefined;
  SMTP_HOST: string | undefined;
  SMTP_PORT: number | undefined;
  SMTP_USER: string | undefined;
  SMTP_PASS: string | undefined;
  FROM_EMAIL: string;
  FROM_NAME: string;
  MAX_FILE_SIZE: number;
  UPLOAD_PATH: string;
  ALLOWED_FILE_TYPES: string;
  OPENAI_API_KEY: string | undefined;
  AI_SERVICE_PROVIDER: string;
  GOOGLE_CLIENT_ID: string | undefined;
  GOOGLE_CLIENT_SECRET: string | undefined;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  BCRYPT_SALT_ROUNDS: number;
  COOKIE_SECRET: string;
  FRONTEND_URL: string;
  BACKEND_URL: string;
} 