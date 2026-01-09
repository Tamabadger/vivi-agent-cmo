export interface StorageConfig {
  provider: 's3' | 'minio';
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region?: string;
  useSSL?: boolean;
  forcePathStyle?: boolean;
}

export interface MediaProcessingConfig {
  quality: 'low' | 'medium' | 'high';
  maxFileSize: number;
  allowedFormats: string[];
  generateThumbnails: boolean;
  extractAudio: boolean;
  analyzeContent: boolean;
}

export interface UploadResult {
  id: string;
  uri: string;
  publicUrl: string;
  metadata: MediaMetadata;
}

export interface MediaMetadata {
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  format: string;
  createdAt: Date;
}

export interface ProcessingResult {
  id: string;
  originalUri: string;
  derivatives: DerivativeMap;
  analysis: MediaAnalysis;
  metadata: MediaMetadata;
  processingTime: number;
}

export interface DerivativeMap {
  thumbnail?: string;
  square?: string;      // 1:1
  portrait?: string;    // 4:5
  story?: string;       // 9:16
  landscape?: string;   // 16:9
  audio?: string;       // Extracted audio
  webp?: string;        // WebP version
}

export interface MediaAnalysis {
  type: 'image' | 'video' | 'audio';
  dominantColors?: string[];
  aspectRatio?: string;
  hasAudio?: boolean;
  hasFaces?: boolean;
  textDetected?: boolean;
  contentSafe: boolean;
  quality: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface AspectRatioConfig {
  name: string;
  ratio: string;
  width: number;
  height: number;
}

export const ASPECT_RATIOS: Record<string, AspectRatioConfig> = {
  square: { name: 'Square', ratio: '1:1', width: 1080, height: 1080 },
  portrait: { name: 'Portrait', ratio: '4:5', width: 1080, height: 1350 },
  story: { name: 'Story', ratio: '9:16', width: 1080, height: 1920 },
  landscape: { name: 'Landscape', ratio: '16:9', width: 1920, height: 1080 }
};

export interface ThumbnailOptions {
  width: number;
  height: number;
  fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  format: 'jpeg' | 'png' | 'webp';
  quality: number;
}

export interface VideoProcessingOptions {
  targetFormat?: string;
  targetCodec?: string;
  targetBitrate?: string;
  extractAudio?: boolean;
  generateThumbnail?: boolean;
  thumbnailTime?: number;
}

export interface AudioProcessingOptions {
  targetFormat?: string;
  targetBitrate?: string;
  normalize?: boolean;
}
