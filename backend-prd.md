# Spacify Backend - Product Requirements Document

## 1. Executive Summary

**Project**: Spacify Backend API
**Purpose**: Replace Supabase integration with a custom Node.js/Express backend and PostgreSQL database
**Target**: Desktop web application for furniture visualization in real spaces

## 2. System Overview

Spacify is a furniture visualization platform where users upload room photos, describe their style preferences, select furniture items, and generate AI-powered visualizations. The backend will handle authentication, file storage, project management, furniture catalog, and AI integration.

## 3. Core Features & API Requirements

### 3.1 User Authentication & Management
- **Email/Password Registration**: User signup with email verification
- **Login System**: JWT-based authentication with refresh tokens
- **Google OAuth**: Social login integration
- **Password Reset**: Secure password reset via email
- **Profile Management**: Update user information, preferences
- **Session Management**: Secure session handling with token refresh

### 3.2 File Management
- **Room Photo Upload**: Handle image uploads up to 15MB
- **Supported Formats**: JPG, PNG, WebP, HEIC
- **File Validation**: Size, format, and security validation
- **Storage**: Cloud storage integration (AWS S3 or similar)
- **Image Processing**: Optional compression and optimization

### 3.3 Project Management
- **Create Projects**: New room design projects
- **Save Projects**: Store original and generated images
- **Project Metadata**: Name, description, timestamps, style preferences
- **Project History**: User's saved projects with thumbnails
- **Update/Delete**: Modify or remove projects

### 3.4 Furniture Catalog
- **Furniture Items**: Comprehensive furniture database
- **Categories**: Living room, bedroom, office, dining room
- **Item Details**: Name, price, dimensions, retailer information
- **Search & Filter**: By category, style, price range
- **Affiliate Integration**: Retailer links and tracking

### 3.5 AI Integration
- **Room Analysis**: Send images to AI services for analysis
- **Style Matching**: Match user preferences with furniture
- **Visualization Generation**: Create before/after room images
- **Processing Queue**: Handle AI requests asynchronously

### 3.6 Analytics & Tracking
- **User Activity**: Track user interactions and preferences
- **Affiliate Clicks**: Monitor click-through rates
- **System Metrics**: Performance and usage analytics

## 4. Technical Requirements

### 4.1 Tech Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with native node-postgres driver
- **Authentication**: JWT with bcrypt for password hashing
- **File Storage**: AWS S3 or compatible storage service
- **Image Processing**: Sharp for image optimization
- **Email**: SendGrid or Nodemailer for transactional emails
- **AI Integration**: OpenAI API or similar services

### 4.2 Database Schema

#### Users Table
```sql
- id (UUID, Primary Key)
- email (String, Unique)
- password_hash (String)
- first_name (String)
- last_name (String)
- avatar_url (String, Optional)
- google_id (String, Optional)
- email_verified (Boolean, Default: false)
- verification_token (String, Optional)
- reset_token (String, Optional)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### Projects Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- name (String)
- description (Text, Optional)
- style_description (Text)
- original_image_url (String)
- generated_image_url (String, Optional)
- status (Enum: draft, processing, completed, failed)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### Furniture Items Table
```sql
- id (UUID, Primary Key)
- name (String)
- description (Text)
- category (String)
- style (String)
- price (Decimal)
- currency (String, Default: 'USD')
- image_url (String)
- retailer_name (String)
- retailer_url (String)
- affiliate_url (String)
- dimensions (JSON)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### Project Furniture Table
```sql
- id (UUID, Primary Key)
- project_id (UUID, Foreign Key)
- furniture_id (UUID, Foreign Key)
- position_x (Integer)
- position_y (Integer)
- scale (Float, Default: 1.0)
- created_at (Timestamp)
```

#### Analytics Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key, Optional)
- event_type (String)
- event_data (JSON)
- ip_address (String)
- user_agent (String)
- created_at (Timestamp)
```

### 4.3 API Endpoints

#### Authentication Endpoints
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/logout - User logout
POST /api/auth/refresh - Refresh JWT token
POST /api/auth/forgot-password - Initiate password reset
POST /api/auth/reset-password - Complete password reset
GET /api/auth/verify-email/:token - Verify email address
POST /api/auth/google - Google OAuth login
```

#### User Management Endpoints
```
GET /api/users/profile - Get user profile
PUT /api/users/profile - Update user profile
DELETE /api/users/account - Delete user account
GET /api/users/projects - Get user's projects
```

#### Project Management Endpoints
```
GET /api/projects - Get user's projects (paginated)
POST /api/projects - Create new project
GET /api/projects/:id - Get specific project
PUT /api/projects/:id - Update project
DELETE /api/projects/:id - Delete project
POST /api/projects/:id/upload - Upload room image
POST /api/projects/:id/generate - Generate visualization
```

#### Furniture Catalog Endpoints
```
GET /api/furniture - Get furniture items (with filters)
GET /api/furniture/categories - Get furniture categories
GET /api/furniture/:id - Get specific furniture item
POST /api/furniture/:id/click - Track affiliate click
```

#### File Upload Endpoints
```
POST /api/upload/image - Upload image file
DELETE /api/upload/:filename - Delete uploaded file
```

## 5. Non-Functional Requirements

### 5.1 Performance
- **Response Time**: API responses under 500ms for most endpoints
- **File Upload**: Handle 15MB files efficiently
- **Concurrent Users**: Support 1000+ concurrent users
- **Database Queries**: Optimized with proper indexing

### 5.2 Security
- **Authentication**: JWT with secure HTTP-only cookies
- **Password Security**: bcrypt hashing with salt rounds
- **File Validation**: Strict file type and size validation
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **CORS**: Proper CORS configuration
- **Input Sanitization**: Validate and sanitize all inputs

### 5.3 Reliability
- **Error Handling**: Comprehensive error responses
- **Logging**: Structured logging for debugging
- **Health Checks**: API health monitoring endpoints
- **Graceful Shutdowns**: Proper cleanup on server shutdown

### 5.4 Scalability
- **Horizontal Scaling**: Stateless API design
- **Database Connection Pooling**: Efficient DB connections
- **Caching**: Redis for session and frequently accessed data
- **CDN**: Static file delivery via CDN

## 6. Integration Requirements

### 6.1 AI Services
- **OpenAI Integration**: For image analysis and generation
- **Fallback Services**: Alternative AI providers for redundancy
- **Queue System**: Background processing for AI tasks
- **Result Caching**: Cache AI results to reduce costs

### 6.2 Email Services
- **Transactional Emails**: Welcome, verification, password reset
- **Email Templates**: Professional HTML email templates
- **Delivery Tracking**: Monitor email delivery success

### 6.3 Cloud Storage
- **AWS S3**: Primary storage for images
- **CDN Integration**: CloudFront for fast image delivery
- **Backup Strategy**: Automated backups and versioning

## 7. Development & Deployment

### 7.1 Development Workflow
- **TypeScript**: Full type safety
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- **Testing**: Jest for unit tests, Supertest for API tests
- **Documentation**: Auto-generated API documentation

### 7.2 Environment Configuration
- **Development**: Local PostgreSQL, file system storage
- **Staging**: Cloud database, cloud storage
- **Production**: Scalable cloud infrastructure

### 7.3 Monitoring & Logging
- **Application Monitoring**: Performance and error tracking
- **Database Monitoring**: Query performance and health
- **Log Aggregation**: Centralized logging system

## 8. Migration Plan

### 8.1 Phase 1: Backend Setup
1. Initialize Node.js/Express project with TypeScript
2. Setup PostgreSQL database with native SQL migrations
3. Implement authentication system
4. Create basic API structure

### 8.2 Phase 2: Core Features
1. Implement user management APIs
2. Add file upload functionality
3. Create project management system
4. Setup furniture catalog

### 8.3 Phase 3: Integration
1. Integrate AI services
2. Add email functionality
3. Implement analytics tracking
4. Setup cloud storage

### 8.4 Phase 4: Frontend Migration
1. Remove Supabase dependencies
2. Update frontend API calls
3. Test all functionality
4. Deploy and monitor

## 9. Success Criteria

- **Functional**: All frontend features work with new backend
- **Performance**: API response times under 500ms
- **Security**: Pass security audit with zero critical issues
- **Reliability**: 99.9% uptime in production
- **Scalability**: Handle 10x current user load
- **Maintainability**: Comprehensive documentation and tests

## 10. Timeline

- **Week 1**: Backend setup and authentication
- **Week 2**: Core APIs and database implementation
- **Week 3**: AI integration and advanced features
- **Week 4**: Frontend migration and testing
- **Week 5**: Deployment and optimization

This PRD provides a comprehensive roadmap for building a robust, scalable backend to replace the Supabase integration while maintaining all current functionality and preparing for future growth. 