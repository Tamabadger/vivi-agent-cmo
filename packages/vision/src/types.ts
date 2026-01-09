export interface VisionAnalysis {
  objects: DetectedObject[];
  text: ExtractedText[];
  brands: DetectedBrand[];
  colors: DominantColor[];
  faces: DetectedFace[];
  emotions: EmotionAnalysis[];
  contentModeration: ContentModeration;
  metadata: ImageMetadata;
}

export interface DetectedObject {
  name: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  attributes: string[];
}

export interface ExtractedText {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  language: string;
}

export interface DetectedBrand {
  name: string;
  confidence: number;
  logo: boolean;
  text: boolean;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DominantColor {
  color: string;
  hex: string;
  rgb: [number, number, number];
  percentage: number;
  name: string;
}

export interface DetectedFace {
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  age?: number;
  gender?: string;
  emotions: EmotionAnalysis[];
}

export interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  intensity: number;
}

export interface ContentModeration {
  safe: boolean;
  categories: {
    violence: number;
    hate: number;
    sexual: number;
    selfHarm: number;
    harassment: number;
  };
  flags: string[];
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  dominantColors: string[];
  brightness: number;
  contrast: number;
  saturation: number;
}

export interface VisionRequest {
  image: Buffer | string; // Buffer or base64 string
  analysisTypes: AnalysisType[];
  maxResults?: number;
  confidenceThreshold?: number;
}

export type AnalysisType = 
  | 'objects'
  | 'text'
  | 'brands'
  | 'colors'
  | 'faces'
  | 'emotions'
  | 'moderation'
  | 'metadata';

export interface VisionResponse {
  analysis: VisionAnalysis;
  processingTime: number;
  model: string;
  cost: number;
  tokens: number;
}
