import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { logger } from '../config/logger';

export interface FurnitureItem {
  id: string;
  name: string;
  image: string;
}

export interface GenerateVisualizationParams {
  roomImagePath: string;
  furnitureItems: FurnitureItem[];
  styleDescription: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private imageGenModel: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    // Using Gemini 2.0 Flash with image generation for creating styled rooms with furniture
    // Configure the model to output both TEXT and IMAGE modalities as required
    this.imageGenModel = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-preview-image-generation'
    });
  }

  /**
   * Generate a visualization by having Gemini 2.0 Flash Preview Image Generation create a styled room with furniture
   */
  async generateVisualization(params: GenerateVisualizationParams): Promise<string> {
    logger.info('Starting furniture visualization generation with Gemini 2.0 Flash Preview Image Generation');
    
    try {
      const { roomImagePath, furnitureItems, styleDescription } = params;

      // Validate inputs
      if (!roomImagePath || !furnitureItems || !styleDescription) {
        throw new Error('Missing required parameters for visualization generation');
      }

      if (!Array.isArray(furnitureItems) || furnitureItems.length === 0) {
        throw new Error('At least one furniture item is required');
      }

      logger.info(`Processing room image: ${roomImagePath}`);
      logger.info(`Style description: ${styleDescription}`);
      logger.info(`Number of furniture items: ${furnitureItems.length}`);

      // Read the room image
      const roomImageBuffer = await fs.readFile(roomImagePath);
      const roomImageBase64 = roomImageBuffer.toString('base64');
      
      logger.info(`Room image loaded, size: ${roomImageBuffer.length} bytes`);

      // Prepare furniture images
      const furnitureImages = await Promise.all(
        furnitureItems.map(async (item) => {
          const furniturePath = this.getFurniturePath(item.image);
          try {
            await fs.access(furniturePath);
            const furnitureBuffer = await fs.readFile(furniturePath);
            return {
              ...item,
              imageData: furnitureBuffer.toString('base64')
            };
          } catch (error) {
            logger.error(`Failed to read furniture image: ${item.image}`, error);
            return null;
          }
        })
      );

      // Filter out any failed furniture image reads
      const validFurnitureImages = furnitureImages.filter(img => img !== null);
      
      logger.info(`Successfully loaded ${validFurnitureImages.length} furniture images`);

      if (validFurnitureImages.length === 0) {
        throw new Error('No furniture images could be loaded successfully');
      }

      // Create a comprehensive prompt for Gemini 2.0 Flash Preview Image Generation to generate a styled room
      const prompt = `You are an expert interior designer AI using Gemini 2.0 Flash Preview Image Generation. I want you to generate a new image that shows this room completely transformed with furniture and styling.

TASK: Create a realistic, beautifully styled interior that incorporates the furniture pieces shown and applies the requested design style.

STYLE: ${styleDescription}

FURNITURE TO INCLUDE:
${validFurnitureImages.map((item, index) => `${index + 1}. ${item!.name} (shown in reference image ${index + 2})`).join('\n')}

REQUIREMENTS:
1. Transform the room to match the "${styleDescription}" aesthetic
2. Naturally integrate all the furniture pieces into the room
3. Place furniture in realistic, functional positions
4. Ensure proper scale and proportions
5. Apply appropriate lighting and shadows
6. Modify wall colors, flooring, or decor elements to match the style
7. Make the room look lived-in and cohesive
8. Maintain the original room's architecture and layout

STYLE GUIDELINES:
- If "Modern Minimalist": Clean lines, neutral colors, uncluttered space, sleek furniture
- If "Mid-century Modern": Warm wood tones, geometric patterns, vintage accents
- If "Scandinavian": Light woods, whites and grays, cozy textures, natural light
- If "Industrial": Exposed brick/metal, dark colors, leather, raw materials
- If "Bohemian": Rich colors, layered textures, plants, eclectic mix

Generate a photorealistic image of the completely transformed and furnished room.`;

      // Prepare image parts for Gemini (room + furniture references)
      const imageParts: Part[] = [
        {
          inlineData: {
            data: roomImageBase64,
            mimeType: this.getMimeType(roomImagePath)
          }
        },
        ...validFurnitureImages.map(item => ({
          inlineData: {
            data: item!.imageData,
            mimeType: 'image/png'
          }
        }))
      ];

      logger.info('Sending request to Gemini 2.0 Flash Preview Image Generation...');
      
      // Generate the styled room with Gemini 2.0 Flash Preview Image Generation
      // Configure the request to expect both TEXT and IMAGE output modalities
      const result = await this.imageGenModel.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            ...imageParts
          ]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      });
      const response = await result.response;
      
      logger.info('Received response from Gemini model');
      
      // Check if the response contains generated images
      if (response.candidates && response.candidates[0] && response.candidates[0].content) {
        const content = response.candidates[0].content;
        
        // Look for inline data in the response (generated image)
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            // Save the generated image
            const outputPath = path.join(
              process.cwd(), 
              'uploads', 
              `styled-room_${Date.now()}.jpg`
            );

            // Ensure uploads directory exists
            await fs.mkdir(path.dirname(outputPath), { recursive: true });

            // Convert base64 to buffer and save
            const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
            await fs.writeFile(outputPath, imageBuffer);

            logger.info(`Generated image saved successfully: ${outputPath}`);
            logger.info(`Generated image size: ${imageBuffer.length} bytes`);

            return outputPath;
          }
        }
      }

      // Fallback: if no image was generated, use the composite approach
      logger.warn('Gemini 2.0 Flash Preview Image Generation did not generate an image, falling back to composite approach');
      return await this.createFallbackComposite(roomImagePath, furnitureItems, styleDescription);
      
    } catch (error) {
      logger.error('Failed to generate visualization with Gemini 2.0 Flash Preview Image Generation:', error);
      
      // Fallback to composite approach if Gemini fails
      try {
        logger.info('Attempting fallback composite approach due to Gemini failure');
        return await this.createFallbackComposite(params.roomImagePath, params.furnitureItems, params.styleDescription);
      } catch (fallbackError) {
        logger.error('Fallback composite also failed:', fallbackError);
        throw new Error(`Both Gemini 2.0 Flash Preview Image Generation and fallback composite failed. Original error: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Helper method to get the correct path for furniture images
   */
  private getFurniturePath(imagePath: string): string {
    if (imagePath.startsWith('/')) {
      // If it's an absolute path from frontend public
      return path.join(process.cwd(), '../frontend/public', imagePath);
    } else if (imagePath.startsWith('src/assets/')) {
      // If it's from assets folder
      return path.join(process.cwd(), '../frontend/', imagePath);
    } else {
      // Default to public folder
      return path.join(process.cwd(), '../frontend/public', imagePath);
    }
  }

  /**
   * Helper method to determine MIME type from file extension
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.heic':
        return 'image/heic';
      default:
        return 'image/jpeg';
    }
  }

  /**
   * Fallback method to create a composite image if Gemini doesn't generate one
   */
  private async createFallbackComposite(
    roomImagePath: string,
    furnitureItems: FurnitureItem[],
    _styleDescription: string
  ): Promise<string> {
    logger.info('Creating fallback composite image');
    
    // Simple fallback: just overlay furniture on the original room
    const roomImage = sharp(roomImagePath);
    const roomMetadata = await roomImage.metadata();
    
    if (!roomMetadata.width || !roomMetadata.height) {
      throw new Error('Unable to get room image dimensions');
    }

    const composites: any[] = [];

    // Simple grid positioning for fallback
    for (let i = 0; i < furnitureItems.length; i++) {
      const item = furnitureItems[i];
      if (!item) continue;
      const furniturePath = this.getFurniturePath(item.image);
      
      try {
        await fs.access(furniturePath);

        const furnitureBuffer = await sharp(furniturePath)
          .resize({
            width: Math.floor(roomMetadata.width * 0.15),
            height: Math.floor(roomMetadata.height * 0.15),
            fit: 'inside',
            withoutEnlargement: false,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .toBuffer();

        const xPosition = (i % 3) * Math.floor(roomMetadata.width / 3) + 50;
        const yPosition = Math.floor(i / 3) * Math.floor(roomMetadata.height / 3) + 100;

        composites.push({
          input: furnitureBuffer,
          top: yPosition,
          left: xPosition,
          blend: 'over'
        });
      } catch (error) {
        logger.error(`Failed to process furniture item in fallback: ${item.name}`, error);
      }
    }

    const outputPath = path.join(
      process.cwd(), 
      'uploads', 
      `fallback-composite_${Date.now()}.jpg`
    );

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    await roomImage
      .composite(composites)
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    return outputPath;
  }

}

// Export singleton instance
export const geminiService = new GeminiService();