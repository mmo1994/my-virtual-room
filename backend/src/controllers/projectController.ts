import { Request, Response } from 'express';
import { catchAsync } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { geminiService } from '../services/geminiService';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';

export class ProjectController {
  // Get all projects for user
  static getProjects = catchAsync(async (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: true,
      message: 'Projects retrieved successfully',
      data: []
    };
    res.status(200).json(response);
  });

  // Create new project
  static createProject = catchAsync(async (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'Project creation not yet implemented'
    };
    res.status(501).json(response);
  });

  // Get single project
  static getProject = catchAsync(async (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'Get project not yet implemented'
    };
    res.status(501).json(response);
  });

  // Update project
  static updateProject = catchAsync(async (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'Project update not yet implemented'
    };
    res.status(501).json(response);
  });

  // Delete project
  static deleteProject = catchAsync(async (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'Project deletion not yet implemented'
    };
    res.status(501).json(response);
  });

  // Upload room image
  static uploadRoomImage = catchAsync(async (req: Request, res: Response): Promise<any> => {
    // Configure multer for file upload
    const storage = multer.diskStorage({
      destination: async (_req, _file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        try {
          await fs.mkdir(uploadDir, { recursive: true });
          cb(null, uploadDir);
        } catch (error: any) {
          cb(error, uploadDir);
        }
      },
      filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        const ext = path.extname(file.originalname);
        cb(null, `room-${uniqueSuffix}${ext}`);
      }
    });

    const upload = multer({
      storage,
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '15728640') // 15MB default
      },
      fileFilter: (_req, file, cb) => {
        const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/heic').split(',');
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only JPG, PNG, WebP, and HEIC are allowed.'));
        }
      }
    }).single('image');

    // Handle file upload
    return new Promise((resolve, reject) => {
      upload(req, res, async (err: any) => {
      if (err) {
        logger.error('File upload error:', err);
        const response: ApiResponse = {
          success: false,
          message: err.message || 'Failed to upload file'
        };
        res.status(400).json(response);
        return reject(err);
      }

      if (!req.file) {
        const response: ApiResponse = {
          success: false,
          message: 'No file provided'
        };
        res.status(400).json(response);
        return reject(new Error('No file provided'));
      }

      // Store file info in database (simplified for now)
      const fileInfo = {
        id: uuidv4(),
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      };

      const response: ApiResponse = {
        success: true,
        message: 'Room image uploaded successfully',
        data: {
          imageId: fileInfo.id,
          filename: fileInfo.filename,
          size: fileInfo.size,
          url: `/uploads/${fileInfo.filename}`
        }
      };
      res.status(200).json(response);
      resolve(response);
    });
    });
  });

  // Generate visualization
  static generateVisualization = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { furnitureItems, styleDescription } = req.body;

    try {
      // In a real implementation, we'd fetch the image path from database using roomImageId
      // For now, we'll construct it based on the pattern
      const uploadDir = path.join(process.cwd(), 'uploads');
      const files = await fs.readdir(uploadDir);
      const roomImageFile = files.find(file => file.includes('room'));
      
      if (!roomImageFile) {
        const response: ApiResponse = {
          success: false,
          message: 'Room image not found'
        };
        res.status(404).json(response);
        return;
      }

      const roomImagePath = path.join(uploadDir, roomImageFile);

      // Generate visualization using Gemini
      const visualizationPath = await geminiService.generateVisualization({
        roomImagePath,
        furnitureItems,
        styleDescription
      });

      // Get the filename from the path
      const visualizationFilename = path.basename(visualizationPath);

      const response: ApiResponse = {
        success: true,
        message: 'Visualization generated successfully',
        data: {
          visualizationId: uuidv4(),
          url: `/uploads/${visualizationFilename}`,
          generatedAt: new Date(),
          styleDescription,
          furnitureCount: furnitureItems.length
        }
      };
      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Visualization generation error:', error);
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to generate visualization'
      };
      res.status(500).json(response);
    }
  });

  // Dedicated method for generating furnished room images using Gemini 2.0 Flash Preview Image Generation
  static generateFurnitureRoom = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { furnitureItems, styleDescription } = req.body;

    try {
      // Find the latest room image file
      const uploadDir = path.join(process.cwd(), 'uploads');
      
      // Find the most recent room image file
      let roomImagePath: string | null = null;
      
      try {
        const files = await fs.readdir(uploadDir);
        const roomImageFile = files
          .filter(file => file.includes('room') && file.match(/\.(jpg|jpeg|png|webp|heic)$/i))
          .sort()
          .pop(); // Get the most recent file
        
        if (roomImageFile) {
          roomImagePath = path.join(uploadDir, roomImageFile);
        }
      } catch (dirError) {
        logger.error('Error reading upload directory:', dirError);
      }

      if (!roomImagePath) {
        const response: ApiResponse = {
          success: false,
          message: 'Room image not found. Please upload a room image first.'
        };
        res.status(404).json(response);
        return;
      }

      // Verify the room image file exists
      try {
        await fs.access(roomImagePath);
      } catch (accessError) {
        logger.error('Room image file not accessible:', accessError);
        const response: ApiResponse = {
          success: false,
          message: 'Room image file is not accessible'
        };
        res.status(404).json(response);
        return;
      }

      logger.info(`Generating furniture visualization for room: ${roomImagePath}`);
      logger.info(`Style: ${styleDescription}`);
      logger.info(`Furniture items: ${furnitureItems.length}`);

      // Generate visualization using Gemini 2.0 Flash Preview Image Generation
      const visualizationPath = await geminiService.generateVisualization({
        roomImagePath,
        furnitureItems,
        styleDescription
      });

      // Get the filename from the path
      const visualizationFilename = path.basename(visualizationPath);

      logger.info(`Visualization generated successfully: ${visualizationFilename}`);

      const response: ApiResponse = {
        success: true,
        message: 'Furnished room image generated successfully using Gemini 2.0 Flash Preview Image Generation',
        data: {
          visualizationId: uuidv4(),
          originalRoomImage: `/uploads/${path.basename(roomImagePath)}`,
          furnishedRoomImage: `/uploads/${visualizationFilename}`,
          generatedAt: new Date().toISOString(),
          styleDescription,
          furnitureCount: furnitureItems.length,
          furnitureItems: furnitureItems.map((item: any) => ({
            id: item.id,
            name: item.name
          })),
          model: 'gemini-2.0-flash-preview-image-generation'
        }
      };
      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Furniture room generation error:', error);
      const response: ApiResponse = {
        success: false,
        message: `Failed to generate furnished room: ${error.message || 'Unknown error occurred'}`
      };
      res.status(500).json(response);
    }
  });
} 