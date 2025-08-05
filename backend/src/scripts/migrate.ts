import dotenv from "dotenv";

const { initializeDatabase } = require('../config/database');
const { logger } = require('../config/logger');

console.log("Migration");
console.log(process.env.DATABASE_URL);

dotenv.config();

const migrations = [
  // Create ENUM types
  `
    DO $$ BEGIN
      CREATE TYPE project_status AS ENUM ('DRAFT', 'PROCESSING', 'COMPLETED', 'FAILED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `,

  // Create users table
  `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      avatar_url TEXT,
      google_id VARCHAR(255) UNIQUE,
      email_verified BOOLEAN DEFAULT FALSE,
      verification_token VARCHAR(255),
      reset_token VARCHAR(255),
      reset_token_expiry TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  // Create projects table
  `
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      style_description TEXT NOT NULL,
      original_image_url TEXT,
      generated_image_url TEXT,
      status project_status DEFAULT 'DRAFT',
      processing_started_at TIMESTAMP WITH TIME ZONE,
      processing_ended_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  // Create furniture_items table
  `
    CREATE TABLE IF NOT EXISTS furniture_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      style VARCHAR(100) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',
      image_url TEXT NOT NULL,
      retailer_name VARCHAR(255) NOT NULL,
      retailer_url TEXT NOT NULL,
      affiliate_url TEXT NOT NULL,
      dimensions JSONB,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  // Create project_furniture table
  `
    CREATE TABLE IF NOT EXISTS project_furniture (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      furniture_id UUID NOT NULL REFERENCES furniture_items(id) ON DELETE CASCADE,
      position_x INTEGER NOT NULL,
      position_y INTEGER NOT NULL,
      scale FLOAT DEFAULT 1.0,
      rotation FLOAT DEFAULT 0.0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(project_id, furniture_id)
    );
  `,

  // Create analytics table
  `
    CREATE TABLE IF NOT EXISTS analytics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      furniture_id UUID REFERENCES furniture_items(id) ON DELETE SET NULL,
      event_type VARCHAR(100) NOT NULL,
      event_data JSONB,
      ip_address INET,
      user_agent TEXT,
      referrer TEXT,
      session_id VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  // Create refresh_tokens table
  `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      token VARCHAR(500) UNIQUE NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  // Create indexes for performance
  `
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
    CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
  `,

  `
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
  `,

  `
    CREATE INDEX IF NOT EXISTS idx_furniture_category ON furniture_items(category);
    CREATE INDEX IF NOT EXISTS idx_furniture_style ON furniture_items(style);
    CREATE INDEX IF NOT EXISTS idx_furniture_price ON furniture_items(price);
    CREATE INDEX IF NOT EXISTS idx_furniture_is_active ON furniture_items(is_active);
  `,

  `
    CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
    CREATE INDEX IF NOT EXISTS idx_analytics_furniture_id ON analytics(furniture_id);
  `,

  `
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
  `,

  // Create function to automatically update updated_at timestamp
  `
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `,

  // Create triggers for updated_at
  `
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `,

  `
    DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
    CREATE TRIGGER update_projects_updated_at
      BEFORE UPDATE ON projects
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `,

  `
    DROP TRIGGER IF EXISTS update_furniture_items_updated_at ON furniture_items;
    CREATE TRIGGER update_furniture_items_updated_at
      BEFORE UPDATE ON furniture_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `
];

const runMigrations = async () => {
  const pool = initializeDatabase();
  const client = await pool.connect();

  try {
    logger.info('Starting database migrations...');

    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      if (migration) {
        logger.info(`Running migration ${i + 1}/${migrations.length}`);
        await client.query(migration);
      }
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  logger.info("Migration");
  logger.info(process.env.DATABASE_URL);

  runMigrations()
    .then(() => {
      logger.info('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations }; 