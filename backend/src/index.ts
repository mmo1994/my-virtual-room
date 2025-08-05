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

// Completely disable security restrictions for development
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
  originAgentCluster: false,
  referrerPolicy: false,
  strictTransportSecurity: false,
  xContentTypeOptions: false,
  xDnsPrefetchControl: false,
  xDownloadOptions: false,
  xFrameOptions: false,
  xPermittedCrossDomainPolicies: false,
  xPoweredBy: false,
  xXssProtection: false
}));

// Allow all origins, methods, and headers
app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*',
  exposedHeaders: '*',
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Add manual CORS headers as backup
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Expose-Headers', '*');
  next();
});

// Disable rate limiting for development
app.use(defaultRateLimit);

// Rate limiting
// app.use(defaultRateLimit);

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