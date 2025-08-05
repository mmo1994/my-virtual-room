import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { catchAsync } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

export class UserController {
  // Get user profile
  static getProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.getUserProfile(req.userId!);
    res.status(200).json(result);
  });

  // Update user profile
  static updateProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.updateUserProfile(req.userId!, req.body);
    res.status(200).json(result);
  });

  // Delete user account
  static deleteAccount = catchAsync(async (_req: Request, res: Response) => {
    // TODO: Implement account deletion
    const response: ApiResponse = {
      success: false,
      message: 'Account deletion not yet implemented'
    };
    res.status(501).json(response);
  });

  // Get user projects
  static getUserProjects = catchAsync(async (_req: Request, res: Response) => {
    // TODO: Implement get user projects
    const response: ApiResponse = {
      success: true,
      message: 'User projects retrieved successfully',
      data: []
    };
    res.status(200).json(response);
  });
} 