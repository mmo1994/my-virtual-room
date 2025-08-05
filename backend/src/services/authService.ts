import { query } from '../config/database';
import { hashPassword, comparePassword, generateTokens, storeRefreshToken, generatePasswordResetToken, validatePasswordResetToken } from '../utils/auth';
import { CreateUserData, LoginData, User, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import { sanitizeEmail } from '../utils/validation';

export class AuthService {
  // Register new user
  static async register(userData: CreateUserData): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> {
    try {
      const { email, password, firstName, lastName } = userData;
      const sanitizedEmail = sanitizeEmail(email);

      // Check if user already exists
      const existingUserResult = await query(
        'SELECT id FROM users WHERE email = $1',
        [sanitizedEmail]
      );

      if (existingUserResult.rows.length > 0) {
        throw new AppError('User with this email already exists', 409, 'USER_EXISTS');
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // TODO: TEMPORARY - Skip email verification for development
      // Generate email verification token
      // const verificationToken = generateRandomToken();

      // Create user
      const newUserResult = await query(`
        INSERT INTO users (
          email, password_hash, first_name, last_name, email_verified
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, first_name, last_name, avatar_url, email_verified, created_at, updated_at
      `, [
        sanitizedEmail,
        passwordHash,
        firstName || null,
        lastName || null,
        true  // TEMPORARY: Set to true to skip email verification
      ]);

      const newUser = newUserResult.rows[0];

      // Generate JWT tokens
      const tokens = generateTokens({
        userId: newUser.id,
        email: newUser.email
      });

      // Store refresh token
      await storeRefreshToken(newUser.id, tokens.refreshToken);

      logger.info('User registered successfully', { userId: newUser.id, email: sanitizedEmail });

      return {
        success: true,
        message: 'User registered successfully and logged in.',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.first_name,
            lastName: newUser.last_name,
            avatarUrl: newUser.avatar_url,
            emailVerified: newUser.email_verified,
            createdAt: newUser.created_at,
            updatedAt: newUser.updated_at
          },
          tokens
        }
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  static async login(loginData: LoginData): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> {
    try {
      const { email, password } = loginData;
      const sanitizedEmail = sanitizeEmail(email);

      // Find user by email
      const userResult = await query(
        'SELECT id, email, password_hash, first_name, last_name, avatar_url, email_verified, created_at, updated_at FROM users WHERE email = $1',
        [sanitizedEmail]
      );

      if (userResult.rows.length === 0) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const user = userResult.rows[0];

      if (!user.password_hash) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      // Generate JWT tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email
      });

      // Store refresh token
      await storeRefreshToken(user.id, tokens.refreshToken);

      // Return user without password hash
      const userResponse = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };

      logger.info('User logged in successfully', { userId: user.id, email: sanitizedEmail });

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          tokens
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  // Verify email address
  static async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const userResult = await query(
        'SELECT id, email, email_verified FROM users WHERE verification_token = $1',
        [token]
      );

      if (userResult.rows.length === 0) {
        throw new AppError('Invalid or expired verification token', 400, 'INVALID_TOKEN');
      }

      const user = userResult.rows[0];

      if (user.email_verified) {
        throw new AppError('Email already verified', 400, 'EMAIL_ALREADY_VERIFIED');
      }

      // Update user as verified
      await query(
        'UPDATE users SET email_verified = $1, verification_token = NULL WHERE id = $2',
        [true, user.id]
      );

      logger.info('Email verified successfully', { userId: user.id, email: user.email });

      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<ApiResponse> {
    try {
      const sanitizedEmail = sanitizeEmail(email);

      const userResult = await query(
        'SELECT id FROM users WHERE email = $1',
        [sanitizedEmail]
      );

      if (userResult.rows.length === 0) {
        // Don't reveal if email exists or not
        return {
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        };
      }

      const user = userResult.rows[0];

      // Generate password reset token
      const resetToken = await generatePasswordResetToken(user.id);

      // TODO: Send password reset email
      logger.info('Password reset requested', { userId: user.id, email: sanitizedEmail, resetToken });

      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      };
    } catch (error) {
      logger.error('Password reset request error:', error);
      throw error;
    }
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    try {
      await validatePasswordResetToken(token);
      const hashedPassword = await hashPassword(newPassword);
      await query('UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = $2', [hashedPassword, token]);

      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      logger.error('Reset password error:', error);
      throw new AppError('Failed to reset password', 500);
    }
  }

  // Change password for authenticated user
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      // Get user's current password hash
      const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
      
      if (userResult.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      const user = userResult.rows[0];
      
      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Check if new password is different from current password
      const isSamePassword = await comparePassword(newPassword, user.password_hash);
      if (isSamePassword) {
        throw new AppError('New password must be different from current password', 400);
      }

      // Hash new password and update
      const hashedNewPassword = await hashPassword(newPassword);
      await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedNewPassword, userId]);

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      logger.error('Change password error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to change password', 500);
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    try {
      const userResult = await query(
        'SELECT id, email, first_name, last_name, avatar_url, email_verified, created_at, updated_at FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const user = userResult.rows[0];

      return {
        success: true,
        message: 'User profile retrieved successfully',
        data: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      };
    } catch (error) {
      logger.error('Get user profile error:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updateData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const { email, firstName, lastName, avatarUrl } = updateData;
      
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramCount = 1;

      if (email) {
        updateFields.push(`email = $${paramCount++}`);
        updateValues.push(sanitizeEmail(email));
      }
      if (firstName !== undefined) {
        updateFields.push(`first_name = $${paramCount++}`);
        updateValues.push(firstName);
      }
      if (lastName !== undefined) {
        updateFields.push(`last_name = $${paramCount++}`);
        updateValues.push(lastName);
      }
      if (avatarUrl !== undefined) {
        updateFields.push(`avatar_url = $${paramCount++}`);
        updateValues.push(avatarUrl);
      }

      if (updateFields.length === 0) {
        throw new AppError('No fields to update', 400, 'NO_UPDATE_FIELDS');
      }

      updateValues.push(userId);

      const updatedUserResult = await query(`
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramCount}
        RETURNING id, email, first_name, last_name, avatar_url, email_verified, created_at, updated_at
      `, updateValues);

      if (updatedUserResult.rows.length === 0) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const updatedUser = updatedUserResult.rows[0];

      logger.info('User profile updated successfully', { userId });

      return {
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          avatarUrl: updatedUser.avatar_url,
          emailVerified: updatedUser.email_verified,
          createdAt: updatedUser.created_at,
          updatedAt: updatedUser.updated_at
        }
      };
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }
} 