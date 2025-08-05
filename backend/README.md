# Spacify Backend

AI-powered furniture visualization platform backend built with Node.js, Express, and PostgreSQL.

## Features

- **Authentication**: JWT-based authentication with email verification and password reset
- **User Management**: User profiles, project management, and account settings
- **Image Upload**: Support for room photos up to 15MB (JPG, PNG, WebP, HEIC)
- **AI Integration**: Ready for AI-powered furniture recommendation and placement
- **Affiliate Tracking**: Click-through tracking for furniture retailer links
- **Rate Limiting**: Protection against abuse with configurable rate limits
- **Security**: CORS, Helmet, input validation, and sanitization

## Development Notes

⚠️ **Email Verification Temporarily Disabled**: For development convenience, email verification is currently skipped during registration. Users are automatically verified and can immediately access protected resources.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with native node-postgres driver
- **Authentication**: JWT with refresh tokens
- **File Upload**: Multer with Sharp for image processing
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Winston with structured logging
- **Testing**: Jest (planned)

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 13 or higher
- npm or yarn package manager

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials. You can use either approach:

**Option 1: Individual variables (recommended)**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=spacify_user
DB_PASSWORD=your_secure_password
DB_NAME=spacify_db
```

**Option 2: Connection string**
```env
DATABASE_URL=postgresql://spacify_user:your_secure_password@localhost:5432/spacify_db
```

### 3. Database Setup

Create your PostgreSQL database and user:

```sql
CREATE USER spacify_user WITH ENCRYPTED PASSWORD 'your_secure_password';
CREATE DATABASE spacify_db OWNER spacify_user;
GRANT ALL PRIVILEGES ON DATABASE spacify_db TO spacify_user;
```

Run the migration script to create tables and indexes:

```bash
npm run build
npm run db:migrate
```

Optionally, seed the database with sample furniture data:

```bash
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration (auto-verified for development)
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Email verification (currently bypassed)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/account` - Delete user account
- `GET /api/users/projects` - Get user's projects

### Project Management

- `GET /api/projects` - Get user's projects (paginated)
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/upload` - Upload room image
- `POST /api/projects/:id/generate` - Generate furniture visualization

### Furniture & Analytics

- `GET /api/furniture` - Get furniture items (with filters)
- `GET /api/furniture/categories` - Get furniture categories
- `GET /api/furniture/:id` - Get furniture item details
- `POST /api/furniture/:id/track` - Track affiliate click

### File Upload

- `POST /api/upload/image` - Upload image file
- `DELETE /api/upload/:filename` - Delete uploaded file

### Health Check

- `GET /api/health` - API health check
- `GET /api/health/db` - Database connection check

## Database Schema

The application uses the following main tables:

- **users**: User accounts with authentication details
- **projects**: User design projects with room images
- **furniture_items**: Available furniture catalog
- **project_furniture**: Furniture placement in projects
- **analytics**: Event tracking for analytics
- **refresh_tokens**: JWT refresh token storage

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting per IP address
- CORS configuration
- Helmet security headers
- SQL injection protection with parameterized queries
- File upload validation (type, size)

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

Common error codes:
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `DATABASE_ERROR` - Database operation failed

## Environment Variables

See `.env.example` for all available configuration options.

**Required database variables:**
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name

**Alternative:**
- `DATABASE_URL` - Full PostgreSQL connection string

**Required security variables:**
- `JWT_SECRET` - Secret for JWT token signing
- `JWT_REFRESH_SECRET` - Secret for refresh token signing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details. 