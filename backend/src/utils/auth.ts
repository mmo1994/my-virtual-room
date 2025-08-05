import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/database';
import { logger } from '../config/logger';

interface TokenPayload {
  userId: string;
  email: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Hash password using bcrypt
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Compare password with hash
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generate JWT tokens
export const generateTokens = (payload: TokenPayload): TokenPair => {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Verify JWT token
export const verifyToken = (token: string, secret: string): TokenPayload | null => {
  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    return payload;
  } catch (error) {
    logger.error('Token verification failed:', error);
    return null;
  }
};

// Store refresh token in database
export const storeRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, refreshToken, expiresAt]
    );
  } catch (error) {
    logger.error('Error storing refresh token:', error);
    throw error;
  }
};

// Validate refresh token
export const validateRefreshToken = async (refreshToken: string): Promise<TokenPayload | null> => {
  try {
    const tokenResult = await query(
      'SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1',
      [refreshToken]
    );

    if (tokenResult.rows.length === 0) {
      return null;
    }

    const tokenData = tokenResult.rows[0];

    // Check if token is expired
    if (new Date() > tokenData.expires_at) {
      // Clean up expired token
      await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
      return null;
    }

    // Get user data
    const userResult = await query(
      'SELECT id, email FROM users WHERE id = $1',
      [tokenData.user_id]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0];

    return {
      userId: user.id,
      email: user.email
    };
  } catch (error) {
    logger.error('Error validating refresh token:', error);
    return null;
  }
};

// Remove refresh token
export const removeRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  } catch (error) {
    logger.error('Error removing refresh token:', error);
    throw error;
  }
};

// Generate random token for email verification
export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate password reset token
export const generatePasswordResetToken = async (userId: string): Promise<string> => {
  try {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, expiresAt, userId]
    );

    return resetToken;
  } catch (error) {
    logger.error('Error generating password reset token:', error);
    throw error;
  }
};

// Validate password reset token
export const validatePasswordResetToken = async (token: string): Promise<{ id: string; email: string } | null> => {
  try {
    const userResult = await query(
      'SELECT id, email, reset_token_expiry FROM users WHERE reset_token = $1',
      [token]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0];

    // Check if token is expired
    if (!user.reset_token_expiry || new Date() > user.reset_token_expiry) {
      // Clean up expired token
      await query(
        'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = $1',
        [user.id]
      );
      return null;
    }

    return {
      id: user.id,
      email: user.email
    };
  } catch (error) {
    logger.error('Error validating password reset token:', error);
    return null;
  }
};

// Clear password reset token
export const clearPasswordResetToken = async (userId: string): Promise<void> => {
  try {
    await query(
      'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = $1',
      [userId]
    );
  } catch (error) {
    logger.error('Error clearing password reset token:', error);
    throw error;
  }
};

// Clean up expired tokens (should be run periodically)
export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    const now = new Date();
    
    // Clean up expired refresh tokens
    const refreshTokenResult = await query(
      'DELETE FROM refresh_tokens WHERE expires_at < $1',
      [now]
    );
    
    // Clean up expired password reset tokens
    const resetTokenResult = await query(
      'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE reset_token_expiry < $1',
      [now]
    );

    logger.info('Cleaned up expired tokens', {
      refreshTokens: refreshTokenResult.rowCount,
      resetTokens: resetTokenResult.rowCount
    });
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
    throw error;
  }
}; 