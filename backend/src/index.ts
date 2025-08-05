import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

import { connectDatabase/*, disconnectDatabase*/ } from './config/database';
import { logger } from './config/logger';
import { globalErrorHandler } from './middleware/errorHandler';
import { defaultRateLimit } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import furnitureRoutes from './routes/furniture';
import uploadRoutes from './routes/upload';
import healthRoutes from './routes/health';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy headers (required for accurate rate limiting behind proxies like Vercel)
app.set('trust proxy', true);

// Security middleware - configure helmet to allow images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP for development
}));
// CORS configuration - allow frontend and development origins
const allowedOrigins = [
  'http://localhost:8080',  // Frontend dev server
  'http://localhost:5173',  // Alternative Vite port
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL, // Production frontend URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS Origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by Sargis CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Rate limiting
app.use(defaultRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));


app.get('/', (req, res) => {
  console.log(req.headers);
  res.send('Hello World');
});

// Serve static files from uploads directory with proper headers
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, /*path, stat*/) => {
    // Set CORS headers for static files
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    });
  }
}));



// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/furniture', furnitureRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware (must be last)
app.use(globalErrorHandler);

// Graceful shutdown
// const gracefulShutdown = async (signal: string) => {
//   logger.info(`Received ${signal}. Starting graceful shutdown...`);

//   try {
//     await disconnectDatabase();
//     logger.info('Graceful shutdown completed');
//     process.exit(0);
//   } catch (error) {
//     logger.error('Error during graceful shutdown:', error);
//     process.exit(1);
//   }
// };

// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// if(process.env.NODE_ENV !== 'development') {
//   app.listen(PORT, () => {
//     logger.info(`Server running on port ${PORT}`);
//     logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
//   });
// }

// Initialize database connection
try {
  connectDatabase();
} catch (error) {
  logger.error('Error connecting to database:', error);
}

// Start server only in development (not for Vercel deployment)
// if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
// }

export default app; 