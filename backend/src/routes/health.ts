import { Router, Request, Response } from 'express';
import { isDatabaseHealthy } from '../config/database';
import { ApiResponse } from '../types';
import { catchAsync } from '../middleware/errorHandler';

const router = Router();

// Basic health check
router.get('/', catchAsync(async (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'Server is healthy',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    }
  };

  res.status(200).json(response);
}));

// Detailed health check with database
router.get('/detailed', catchAsync(async (_req: Request, res: Response) => {
  const dbHealthy = await isDatabaseHealthy();
  
  const healthData = {
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: dbHealthy ? 'healthy' : 'unhealthy',
      server: 'healthy'
    },
    system: {
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    }
  };

  const response: ApiResponse = {
    success: dbHealthy,
    message: dbHealthy ? 'All services are healthy' : 'Some services are unhealthy',
    data: healthData
  };

  res.status(dbHealthy ? 200 : 503).json(response);
}));

// Readiness probe (for Kubernetes)
router.get('/ready', catchAsync(async (_req: Request, res: Response) => {
  const dbHealthy = await isDatabaseHealthy();
  
  if (dbHealthy) {
    const response: ApiResponse = {
      success: true,
      message: 'Service is ready',
      data: { ready: true }
    };
    res.status(200).json(response);
  } else {
    const response: ApiResponse = {
      success: false,
      message: 'Service is not ready',
      data: { ready: false }
    };
    res.status(503).json(response);
  }
}));

// Liveness probe (for Kubernetes)
router.get('/live', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'Service is alive',
    data: { alive: true }
  };
  res.status(200).json(response);
});

export default router; 