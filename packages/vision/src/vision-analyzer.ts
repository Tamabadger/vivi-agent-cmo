import OpenAI from 'openai';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import { 
  VisionRequest, 
  VisionResponse, 
  VisionAnalysis, 
  AnalysisType,
  DetectedObject,
  ExtractedText,
  DetectedBrand,
  DominantColor,
  DetectedFace,
  EmotionAnalysis,
  ContentModeration,
  ImageMetadata
} from './types';

export class VisionAnalyzer {
  private openai: OpenAI;
  private confidenceThreshold: number;

  constructor(openaiApiKey: string, confidenceThreshold: number = 0.7) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.confidenceThreshold = confidenceThreshold;
  }

  async analyzeImage(request: VisionRequest): Promise<VisionResponse> {
    const startTime = Date.now();
    
    try {
      // Prepare image for analysis
      const imageBuffer = await this.prepareImage(request.image);
      
      // Perform analysis based on requested types
      const analysis: VisionAnalysis = {
        objects: [],
        text: [],
        brands: [],
        colors: [],
        faces: [],
        emotions: [],
        contentModeration: {
          safe: true,
          categories: {
            violence: 0,
            hate: 0,
            sexual: 0,
            selfHarm: 0,
            harassment: 0
          },
          flags: []
        },
        metadata: await this.extractMetadata(imageBuffer)
      };

      // OpenAI Vision API for objects, faces, and general analysis
      if (request.analysisTypes.some(type => ['objects', 'faces', 'emotions', 'moderation'].includes(type))) {
        const openaiAnalysis = await this.openaiVisionAnalysis(imageBuffer, request.analysisTypes);
        Object.assign(analysis, openaiAnalysis);
      }

      // OCR for text extraction
      if (request.analysisTypes.includes('text')) {
        analysis.text = await this.extractText(imageBuffer);
      }

      // Color analysis
      if (request.analysisTypes.includes('colors')) {
        analysis.colors = await this.analyzeColors(imageBuffer);
      }

      // Brand detection
      if (request.analysisTypes.includes('brands')) {
        analysis.brands = await this.detectBrands(imageBuffer, analysis.text);
      }

      const processingTime = Date.now() - startTime;

      return {
        analysis,
        processingTime,
        model: 'gpt-4o',
        cost: 0, // Will be calculated by LLM router
        tokens: 0 // Will be calculated by LLM router
      };

    } catch (error) {
      console.error('Vision analysis failed:', error);
      throw new Error(`Vision analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async prepareImage(image: Buffer | string): Promise<Buffer> {
    if (typeof image === 'string') {
      // Convert base64 to buffer
      return Buffer.from(image, 'base64');
    }
    return image;
  }

  private async openaiVisionAnalysis(
    imageBuffer: Buffer, 
    analysisTypes: AnalysisType[]
  ): Promise<Partial<VisionAnalysis>> {
    try {
      // Convert image to base64 for OpenAI
      const base64Image = imageBuffer.toString('base64');
      
      // Build prompt based on requested analysis types
      let prompt = 'Analyze this image and provide detailed information about:';
      
      if (analysisTypes.includes('objects')) {
        prompt += '\n- Objects and items visible in the image';
      }
      if (analysisTypes.includes('faces')) {
        prompt += '\n- People and faces (age, gender, emotions)';
      }
      if (analysisTypes.includes('emotions')) {
        prompt += '\n- Emotional expressions and mood';
      }
      if (analysisTypes.includes('moderation')) {
        prompt += '\n- Content safety and moderation concerns';
      }

      prompt += '\n\nProvide the analysis in JSON format with the following structure:';
      prompt += '\n{\n  "objects": [{"name": "string", "confidence": number, "attributes": ["string"]}],';
      prompt += '\n  "faces": [{"confidence": number, "age": number, "gender": "string", "emotions": [{"emotion": "string", "confidence": number}]}],';
      prompt += '\n  "moderation": {"safe": boolean, "flags": ["string"]}\n}';

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a computer vision expert. Analyze images and provide detailed, accurate information in the requested JSON format.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from OpenAI Vision API');
      }

      // Parse JSON response
      const analysis = JSON.parse(content);
      
      // Transform to our format
      const result: Partial<VisionAnalysis> = {};
      
      if (analysis.objects) {
        result.objects = analysis.objects.map((obj: any) => ({
          name: obj.name,
          confidence: obj.confidence || 0.9,
          boundingBox: { x: 0, y: 0, width: 0, height: 0 }, // OpenAI doesn't provide bounding boxes
          attributes: obj.attributes || []
        }));
      }

      if (analysis.faces) {
        result.faces = analysis.faces.map((face: any) => ({
          confidence: face.confidence || 0.9,
          boundingBox: { x: 0, y: 0, width: 0, height: 0 },
          age: face.age,
          gender: face.gender,
          emotions: face.emotions || []
        }));
      }

      if (analysis.moderation) {
        result.contentModeration = {
          safe: analysis.moderation.safe !== false,
          categories: {
            violence: 0,
            hate: 0,
            sexual: 0,
            selfHarm: 0,
            harassment: 0
          },
          flags: analysis.moderation.flags || []
        };
      }

      return result;

    } catch (error) {
      console.error('OpenAI Vision API analysis failed:', error);
      return {};
    }
  }

  private async extractText(imageBuffer: Buffer): Promise<ExtractedText[]> {
    try {
      const worker = await createWorker();
      
      // Preprocess image for better OCR
      const processedImage = await sharp(imageBuffer)
        .grayscale()
        .sharpen()
        .toBuffer();

      const { data } = await worker.recognize(processedImage);
      await worker.terminate();

      if (!data.text || data.text.trim().length === 0) {
        return [];
      }

      // Split text into lines and create text objects
      const lines = data.text.split('\n').filter(line => line.trim().length > 0);
      
      return lines.map((line, index) => ({
        text: line.trim(),
        confidence: 0.8, // Tesseract doesn't provide per-line confidence
        boundingBox: { x: 0, y: index * 20, width: 0, height: 20 },
        language: 'en'
      }));

    } catch (error) {
      console.error('OCR text extraction failed:', error);
      return [];
    }
  }

  private async analyzeColors(imageBuffer: Buffer): Promise<DominantColor[]> {
    try {
      // Resize image for faster processing
      const resized = await sharp(imageBuffer)
        .resize(150, 150, { fit: 'inside' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { data, info } = resized;
      const pixels = new Uint8Array(data);
      
      // Simple color clustering (in production, use more sophisticated algorithms)
      const colorMap = new Map<string, number>();
      
      for (let i = 0; i < pixels.length; i += 3) {
        const r = Math.round(pixels[i] / 32) * 32;
        const g = Math.round(pixels[i + 1] / 32) * 32;
        const b = Math.round(pixels[i + 2] / 32) * 32;
        
        const key = `${r},${g},${b}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }

      // Get top colors
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const totalPixels = info.width * info.height;
      
      return sortedColors.map(([color, count]) => {
        const [r, g, b] = color.split(',').map(Number);
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        const percentage = (count / totalPixels) * 100;
        
        return {
          color: color,
          hex,
          rgb: [r, g, b] as [number, number, number],
          percentage: Math.round(percentage * 100) / 100,
          name: this.getColorName(r, g, b)
        };
      });

    } catch (error) {
      console.error('Color analysis failed:', error);
      return [];
    }
  }

  private async detectBrands(
    imageBuffer: Buffer, 
    extractedText: ExtractedText[]
  ): Promise<DetectedBrand[]> {
    try {
      // Simple brand detection based on text and common brand names
      const commonBrands = [
        'nike', 'adidas', 'apple', 'samsung', 'coca-cola', 'pepsi',
        'mcdonalds', 'starbucks', 'netflix', 'spotify', 'amazon',
        'google', 'facebook', 'instagram', 'twitter', 'linkedin'
      ];

      const detectedBrands: DetectedBrand[] = [];
      
      // Check extracted text for brand names
      for (const textObj of extractedText) {
        const text = textObj.text.toLowerCase();
        
        for (const brand of commonBrands) {
          if (text.includes(brand)) {
            detectedBrands.push({
              name: brand.charAt(0).toUpperCase() + brand.slice(1),
              confidence: 0.8,
              logo: false,
              text: true
            });
          }
        }
      }

      // TODO: Add logo detection using computer vision models
      // This would require training a custom model or using a specialized service

      return detectedBrands;

    } catch (error) {
      console.error('Brand detection failed:', error);
      return [];
    }
  }

  private async extractMetadata(imageBuffer: Buffer): Promise<ImageMetadata> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      
      // Calculate basic image properties
      const { data, info } = await sharp(imageBuffer)
        .raw()
        .toBuffer({ resolveWithObject: true });

      const pixels = new Uint8Array(data);
      let totalBrightness = 0;
      let totalContrast = 0;
      
      // Calculate brightness and contrast
      for (let i = 0; i < pixels.length; i += 3) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        // Brightness calculation
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;
        
        // Simple contrast calculation
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        totalContrast += (max - min);
      }

      const avgBrightness = totalBrightness / (pixels.length / 3);
      const avgContrast = totalContrast / (pixels.length / 3);

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: imageBuffer.length,
        dominantColors: [], // Will be filled by color analysis
        brightness: Math.round(avgBrightness),
        contrast: Math.round(avgContrast),
        saturation: 0 // Would need more complex calculation
      };

    } catch (error) {
      console.error('Metadata extraction failed:', error);
      return {
        width: 0,
        height: 0,
        format: 'unknown',
        size: imageBuffer.length,
        dominantColors: [],
        brightness: 0,
        contrast: 0,
        saturation: 0
      };
    }
  }

  private getColorName(r: number, g: number, b: number): string {
    // Simple color naming based on RGB values
    if (r > 200 && g > 200 && b > 200) return 'White';
    if (r < 50 && g < 50 && b < 50) return 'Black';
    if (r > 200 && g < 100 && b < 100) return 'Red';
    if (r < 100 && g > 200 && b < 100) return 'Green';
    if (r < 100 && g < 100 && b > 200) return 'Blue';
    if (r > 200 && g > 200 && b < 100) return 'Yellow';
    if (r > 200 && g < 100 && b > 200) return 'Magenta';
    if (r < 100 && g > 200 && b > 200) return 'Cyan';
    if (r > 150 && g > 100 && b < 100) return 'Orange';
    if (r > 150 && g < 100 && b > 150) return 'Purple';
    
    return 'Gray';
  }
}
