import { Request, Response } from 'express';
import { catchAsync } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

export class UploadController {
  // Upload image file
  static uploadImage = catchAsync(async (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'Image upload not yet implemented'
    };
    res.status(501).json(response);
  });

  // Delete uploaded file
  static deleteFile = catchAsync(async (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'File deletion not yet implemented'
    };
    res.status(501).json(response);
  });
} 