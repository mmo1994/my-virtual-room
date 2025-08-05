import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { catchAsync } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

export class AuthController {
  // Register new user
  static register = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  });

  // Login user
  static login = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    res.status(200).json(result);
  });

  // Verify email
  static verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;
    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Verification token is required'
      };
      res.status(400).json(response);
      return;
    }
    const result = await AuthService.verifyEmail(token);
    res.status(200).json(result);
  });

  // Forgot password
  static forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await AuthService.requestPasswordReset(email);
    res.status(200).json(result);
  });

  // Reset password
  static resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    const result = await AuthService.resetPassword(token, password);
    res.status(200).json(result);
  });

  // Change password
  static changePassword = catchAsync(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const result = await AuthService.changePassword(req.userId!, currentPassword, newPassword);
    res.status(200).json(result);
  });

  // Refresh token
  static refreshToken = catchAsync(async (_req: Request, res: Response) => {
    // TODO: Implement refresh token logic
    const response: ApiResponse = {
      success: false,
      message: 'Refresh token functionality not yet implemented'
    };
    res.status(501).json(response);
  });

  // Logout user
  static logout = catchAsync(async (_req: Request, res: Response) => {
    // TODO: Implement logout logic (remove refresh token)
    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully'
    };
    res.status(200).json(response);
  });

  // Get current user
  static getCurrentUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.getUserProfile(req.userId!);
    res.status(200).json(result);
  });
} 