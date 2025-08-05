import { Pool, PoolClient } from 'pg';
import { logger } from './logger';

// Database connection pool
let pool: Pool;

// Initialize database connection pool
export const initializeDatabase = (): Pool => {
  if (!pool) {
    // Use individual environment variables for database connection
    const config = {
      connectionString: process.env.DATABASE_URL,
      ssl: false,
      max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'), // Maximum number of clients in the pool
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // Close idle clients after 30 seconds
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'), // Return an error after 2 seconds if connection could not be established
    };

    pool = new Pool(config);

    // Handle pool errors
    pool.on('error', (err: Error) => {
      logger.error('Unexpected error on idle client', err);
    });

    // Handle pool connection
    pool.on('connect', () => {
      logger.debug('New client connected to database');
    });

    // Handle pool removal
    pool.on('remove', () => {
      logger.debug('Client removed from pool');
    });

    // Log connection details (without password)
    logger.info('Database pool initialized', {
      maxConnections: config.max
    });
  }
  
  return pool;
};

// Get database pool instance
export const getDatabase = (): Pool => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool;
};

// Connect to database and test connection
export const connectDatabase = async (): Promise<void> => {
  try {
    const db = initializeDatabase();
    const client = await db.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('Connected to PostgreSQL database successfully');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (pool) {
      await pool.end();
      logger.info('Disconnected from database');
    }
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
};

// Database health check
export const isDatabaseHealthy = async (): Promise<boolean> => {
  try {
    const db = getDatabase();
    const client = await db.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

// Execute a query with automatic connection management
export const query = async (text: string, params?: any[]): Promise<any> => {
  const db = getDatabase();
  const client = await db.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Execute a transaction
export const transaction = async (callback: (client: PoolClient) => Promise<any>): Promise<any> => {
  const db = getDatabase();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default { 
  initializeDatabase, 
  getDatabase, 
  connectDatabase, 
  disconnectDatabase, 
  isDatabaseHealthy, 
  query, 
  transaction 
}; 