import { initializeDatabase } from '../config/database';
import { logger } from '../config/logger';
import { Pool } from 'pg';

const furnitureData = [
  {
    name: 'Modern Sectional Sofa',
    description: 'Comfortable L-shaped sectional sofa perfect for modern living rooms',
    category: 'Seating',
    style: 'Modern',
    price: 1299.99,
    currency: 'USD',
    image_url: '/assets/furniture/sofa-modern.png',
    retailer_name: 'West Elm',
    retailer_url: 'https://westelm.com',
    affiliate_url: 'https://westelm.com?affiliate=spacify',
    dimensions: { width: 108, height: 35, depth: 75 },
    is_active: true
  },
  {
    name: 'Neutral Fabric Sofa',
    description: 'Versatile neutral sofa that complements any decor style',
    category: 'Seating',
    style: 'Transitional',
    price: 899.99,
    currency: 'USD',
    image_url: '/assets/furniture/sofa-neutral.png',
    retailer_name: 'IKEA',
    retailer_url: 'https://ikea.com',
    affiliate_url: 'https://ikea.com?affiliate=spacify',
    dimensions: { width: 90, height: 32, depth: 36 },
    is_active: true
  },
  {
    name: 'Leather Armchair',
    description: 'Premium leather armchair with excellent back support',
    category: 'Seating',
    style: 'Traditional',
    price: 699.99,
    currency: 'USD',
    image_url: '/assets/furniture/armchair-leather.png',
    retailer_name: 'Pottery Barn',
    retailer_url: 'https://potterybarn.com',
    affiliate_url: 'https://potterybarn.com?affiliate=spacify',
    dimensions: { width: 32, height: 40, depth: 36 },
    is_active: true
  },
  {
    name: 'Glass Coffee Table',
    description: 'Sleek glass coffee table with metal frame',
    category: 'Tables',
    style: 'Modern',
    price: 349.99,
    currency: 'USD',
    image_url: '/assets/furniture/coffee-table.png',
    retailer_name: 'CB2',
    retailer_url: 'https://cb2.com',
    affiliate_url: 'https://cb2.com?affiliate=spacify',
    dimensions: { width: 48, height: 16, depth: 24 },
    is_active: true
  },
  {
    name: 'Wooden Dining Table',
    description: 'Solid wood dining table that seats 6 people comfortably',
    category: 'Tables',
    style: 'Rustic',
    price: 799.99,
    currency: 'USD',
    image_url: '/assets/furniture/table-dining.png',
    retailer_name: 'World Market',
    retailer_url: 'https://worldmarket.com',
    affiliate_url: 'https://worldmarket.com?affiliate=spacify',
    dimensions: { width: 72, height: 30, depth: 36 },
    is_active: true
  },
  {
    name: 'Minimalist Desk',
    description: 'Clean-lined desk perfect for home office setups',
    category: 'Desks',
    style: 'Minimalist',
    price: 449.99,
    currency: 'USD',
    image_url: '/assets/furniture/desk.png',
    retailer_name: 'Article',
    retailer_url: 'https://article.com',
    affiliate_url: 'https://article.com?affiliate=spacify',
    dimensions: { width: 60, height: 29, depth: 24 },
    is_active: true
  },
  {
    name: 'Modern Floor Lamp',
    description: 'Tall floor lamp with adjustable brightness',
    category: 'Lighting',
    style: 'Modern',
    price: 179.99,
    currency: 'USD',
    image_url: '/assets/furniture/floor-lamp.png',
    retailer_name: 'Target',
    retailer_url: 'https://target.com',
    affiliate_url: 'https://target.com?affiliate=spacify',
    dimensions: { width: 12, height: 65, depth: 12 },
    is_active: true
  },
  {
    name: 'Bookshelf Unit',
    description: 'Multi-shelf bookcase for storage and display',
    category: 'Storage',
    style: 'Scandinavian',
    price: 329.99,
    currency: 'USD',
    image_url: '/assets/furniture/bookshelf.png',
    retailer_name: 'IKEA',
    retailer_url: 'https://ikea.com',
    affiliate_url: 'https://ikea.com?affiliate=spacify',
    dimensions: { width: 31, height: 79, depth: 11 },
    is_active: true
  },
  {
    name: 'Queen Size Bed Frame',
    description: 'Upholstered queen bed frame with headboard',
    category: 'Bedroom',
    style: 'Contemporary',
    price: 549.99,
    currency: 'USD',
    image_url: '/assets/furniture/bed-queen.png',
    retailer_name: 'Wayfair',
    retailer_url: 'https://wayfair.com',
    affiliate_url: 'https://wayfair.com?affiliate=spacify',
    dimensions: { width: 64, height: 54, depth: 84 },
    is_active: true
  },
  {
    name: 'Wooden Nightstand',
    description: 'Two-drawer nightstand with modern hardware',
    category: 'Bedroom',
    style: 'Mid-Century',
    price: 199.99,
    currency: 'USD',
    image_url: '/assets/furniture/nightstand.png',
    retailer_name: 'West Elm',
    retailer_url: 'https://westelm.com',
    affiliate_url: 'https://westelm.com?affiliate=spacify',
    dimensions: { width: 24, height: 24, depth: 18 },
    is_active: true
  }
];

export const seedDatabase = async (): Promise<void> => {
  const pool: Pool = initializeDatabase();
  const client = await pool.connect();

  try {
    logger.info('Starting database seeding...');

    // Check if furniture items already exist
    const existingCount = await client.query('SELECT COUNT(*) FROM furniture_items');
    if (parseInt(existingCount.rows[0].count) > 0) {
      logger.info('Furniture items already exist, skipping seed');
      return;
    }

    // Insert furniture items
    for (const item of furnitureData) {
      await client.query(`
        INSERT INTO furniture_items (
          name, description, category, style, price, currency,
          image_url, retailer_name, retailer_url, affiliate_url,
          dimensions, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        item.name,
        item.description,
        item.category,
        item.style,
        item.price,
        item.currency,
        item.image_url,
        item.retailer_name,
        item.retailer_url,
        item.affiliate_url,
        JSON.stringify(item.dimensions),
        item.is_active
      ]);
    }

    logger.info(`Seeded ${furnitureData.length} furniture items successfully`);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed script failed:', error);
      process.exit(1);
    });
} 