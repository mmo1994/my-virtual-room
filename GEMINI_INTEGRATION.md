# Imagen 3 AI Integration for Spacify

This document explains how the Google Imagen 3 integration works for generating styled room images with furniture.

## Overview

The app uses Google's Imagen 3 via Vertex AI to generate photorealistic styled room images based on:
1. Style preferences (e.g., "Modern Minimalist", "Mid-century modern")
2. Selected furniture items from the catalog
3. Detailed prompts that describe the desired interior design aesthetic

## How It Works

### 1. User Uploads Room Photo
- Supported formats: JPG, PNG, WebP, HEIC
- Maximum file size: 15MB

### 2. User Specifies Style
- Enter style preferences like "Modern Minimalist design"
- The AI considers this when suggesting furniture placement

### 3. User Selects Furniture
- Choose from the furniture catalog
- Multiple items can be selected

### 4. AI Image Generation
The backend uses Google Imagen 3 to:
- Process detailed style prompts with furniture requirements
- Generate photorealistic styled room images from scratch
- Naturally integrate furniture pieces into cohesive interior designs
- Apply proper lighting, shadows, perspective, and proportions
- Create professionally styled room showcases

### 5. Fallback Approach
If Imagen 3 fails or is unavailable:
- Falls back to Sharp image compositing
- Overlays furniture images on the original room
- Provides basic placement as a backup solution

## Technical Implementation

### Backend Service (`backend/src/services/geminiService.ts`)
- Uses Google Imagen 3 via Vertex AI REST API for native image generation
- Sends detailed style prompts + furniture requirements to Imagen 3
- Imagen 3 generates photorealistic styled room images with proper furniture integration
- Includes intelligent furniture placement, lighting, and style transformation
- Falls back to Sharp image compositing if Imagen 3 fails or is unavailable

### API Endpoints
- `POST /api/projects/upload-room` - Upload room image
- `POST /api/projects/generate` - Generate visualization with furniture

### Frontend Integration
- Upload component handles file selection
- Sends room image, style, and furniture selections to backend
- Displays before/after comparison in a modal

## Setup Requirements

1. **Environment Variables**
   ```bash
   # API Keys (still needed for fallback functionality)
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Google Cloud Configuration (required for Imagen 3)
   GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
   ```

2. **Google Cloud Setup**
   - Create a Google Cloud Project
   - Enable the Vertex AI API
   - Create a service account with Vertex AI permissions
   - Download the service account key JSON file
   - Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

3. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

4. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

## Usage

1. Sign up/Login to the app
2. Click "Create New Project" or use the upload section
3. Upload a room photo
4. Enter style preferences (e.g., "Modern Minimalist")
5. Click "Add Furniture" and select items
6. Click "Generate Furniture Visualization"
7. View the result with furniture placed in your room

## Limitations

- Depends on Google Imagen 3 API availability and performance
- Requires Google Cloud Project with Vertex AI API enabled
- Image generation quality varies based on prompt complexity and furniture selection
- Does not currently use the original room image as reference (generates from scratch)
- Fallback approach provides basic overlay if Imagen 3 fails

## Future Improvements

- Implement more sophisticated fallback positioning algorithms
- Add support for custom furniture uploads
- Include room dimension analysis for better scaling
- Support for multiple style combinations
- Add before/after style transformation controls