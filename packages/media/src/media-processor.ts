import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import { StorageManager } from './storage-manager';
import {
  MediaProcessingConfig,
  ProcessingResult,
  DerivativeMap,
  MediaAnalysis,
  MediaMetadata,
  ASPECT_RATIOS,
  ThumbnailOptions
} from './types';

export class MediaProcessor {
  private storageManager: StorageManager;
  private config: MediaProcessingConfig;

  constructor(storageManager: StorageManager, config: MediaProcessingConfig) {
    this.storageManager = storageManager;
    this.config = config;
  }

  async processMedia(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    orgId: string
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const id = uuidv4();

    // Validate file size
    if (buffer.length > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.config.maxFileSize} bytes`);
    }

    // Validate format
    if (!this.config.allowedFormats.includes(mimeType)) {
      throw new Error(`File format ${mimeType} is not allowed`);
    }

    // Determine media type
    const mediaType = this.getMediaType(mimeType);

    // Upload original
    const uploadResult = await this.storageManager.upload(buffer, filename, mimeType, orgId);

    // Process based on media type
    let derivatives: DerivativeMap = {};
    let analysis: MediaAnalysis;
    let metadata: MediaMetadata = uploadResult.metadata;

    try {
      switch (mediaType) {
        case 'image':
          const imageResult = await this.processImage(buffer, orgId, id);
          derivatives = imageResult.derivatives;
          analysis = imageResult.analysis;
          metadata = { ...metadata, ...imageResult.metadata };
          break;

        case 'video':
          const videoResult = await this.processVideo(buffer, orgId, id, filename);
          derivatives = videoResult.derivatives;
          analysis = videoResult.analysis;
          metadata = { ...metadata, ...videoResult.metadata };
          break;

        case 'audio':
          const audioResult = await this.processAudio(buffer, orgId, id, filename);
          derivatives = audioResult.derivatives;
          analysis = audioResult.analysis;
          metadata = { ...metadata, ...audioResult.metadata };
          break;

        default:
          analysis = {
            type: 'image',
            contentSafe: true,
            quality: 'medium'
          };
      }
    } catch (error) {
      console.error('Media processing error:', error);
      // Return with minimal analysis if processing fails
      analysis = {
        type: mediaType,
        contentSafe: true,
        quality: 'medium'
      };
    }

    const processingTime = Date.now() - startTime;

    return {
      id,
      originalUri: uploadResult.uri,
      derivatives,
      analysis,
      metadata,
      processingTime
    };
  }

  private getMediaType(mimeType: string): 'image' | 'video' | 'audio' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'image'; // Default to image
  }

  private async processImage(
    buffer: Buffer,
    orgId: string,
    id: string
  ): Promise<{
    derivatives: DerivativeMap;
    analysis: MediaAnalysis;
    metadata: Partial<MediaMetadata>;
  }> {
    const derivatives: DerivativeMap = {};
    const image = sharp(buffer);
    const sharpMetadata = await image.metadata();

    // Extract image metadata
    const metadata: Partial<MediaMetadata> = {
      width: sharpMetadata.width,
      height: sharpMetadata.height,
      format: sharpMetadata.format || 'unknown'
    };

    // Generate thumbnail
    if (this.config.generateThumbnails) {
      const thumbnailBuffer = await this.generateThumbnail(buffer, {
        width: 300,
        height: 300,
        fit: 'cover',
        format: 'jpeg',
        quality: 80
      });

      const thumbResult = await this.storageManager.upload(
        thumbnailBuffer,
        `${id}_thumb.jpg`,
        'image/jpeg',
        orgId
      );
      derivatives.thumbnail = thumbResult.uri;
    }

    // Generate aspect ratio derivatives
    const width = sharpMetadata.width || 1080;
    const height = sharpMetadata.height || 1080;

    // Square (1:1)
    const squareBuffer = await this.resizeToAspectRatio(buffer, 'square');
    const squareResult = await this.storageManager.upload(
      squareBuffer,
      `${id}_square.jpg`,
      'image/jpeg',
      orgId
    );
    derivatives.square = squareResult.uri;

    // Portrait (4:5)
    const portraitBuffer = await this.resizeToAspectRatio(buffer, 'portrait');
    const portraitResult = await this.storageManager.upload(
      portraitBuffer,
      `${id}_portrait.jpg`,
      'image/jpeg',
      orgId
    );
    derivatives.portrait = portraitResult.uri;

    // Story (9:16)
    const storyBuffer = await this.resizeToAspectRatio(buffer, 'story');
    const storyResult = await this.storageManager.upload(
      storyBuffer,
      `${id}_story.jpg`,
      'image/jpeg',
      orgId
    );
    derivatives.story = storyResult.uri;

    // Landscape (16:9)
    const landscapeBuffer = await this.resizeToAspectRatio(buffer, 'landscape');
    const landscapeResult = await this.storageManager.upload(
      landscapeBuffer,
      `${id}_landscape.jpg`,
      'image/jpeg',
      orgId
    );
    derivatives.landscape = landscapeResult.uri;

    // WebP version
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 85 })
      .toBuffer();
    const webpResult = await this.storageManager.upload(
      webpBuffer,
      `${id}.webp`,
      'image/webp',
      orgId
    );
    derivatives.webp = webpResult.uri;

    // Analyze image
    const analysis = await this.analyzeImage(buffer, sharpMetadata);

    return { derivatives, analysis, metadata };
  }

  private async generateThumbnail(buffer: Buffer, options: ThumbnailOptions): Promise<Buffer> {
    return sharp(buffer)
      .resize(options.width, options.height, { fit: options.fit })
      .toFormat(options.format, { quality: options.quality })
      .toBuffer();
  }

  private async resizeToAspectRatio(buffer: Buffer, ratioName: string): Promise<Buffer> {
    const ratio = ASPECT_RATIOS[ratioName];
    if (!ratio) {
      throw new Error(`Unknown aspect ratio: ${ratioName}`);
    }

    return sharp(buffer)
      .resize(ratio.width, ratio.height, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  private async analyzeImage(
    buffer: Buffer,
    metadata: sharp.Metadata
  ): Promise<MediaAnalysis> {
    // Simple color extraction from stats
    const stats = await sharp(buffer).stats();
    const dominantColors = stats.channels.map(ch =>
      `rgb(${Math.round(ch.mean)}, ${Math.round(ch.mean)}, ${Math.round(ch.mean)})`
    );

    // Calculate aspect ratio
    const width = metadata.width || 1;
    const height = metadata.height || 1;
    const aspectRatio = `${width}:${height}`;

    // Determine quality based on resolution
    let quality: 'low' | 'medium' | 'high' = 'medium';
    const pixels = width * height;
    if (pixels < 500000) quality = 'low';
    else if (pixels > 2000000) quality = 'high';

    return {
      type: 'image',
      dominantColors,
      aspectRatio,
      contentSafe: true, // Would need content moderation API for real check
      quality,
      tags: []
    };
  }

  private async processVideo(
    buffer: Buffer,
    orgId: string,
    id: string,
    filename: string
  ): Promise<{
    derivatives: DerivativeMap;
    analysis: MediaAnalysis;
    metadata: Partial<MediaMetadata>;
  }> {
    const derivatives: DerivativeMap = {};

    // For video processing, we'd need to write to a temp file
    // This is a simplified version
    const metadata: Partial<MediaMetadata> = {
      format: filename.split('.').pop() || 'mp4'
    };

    const analysis: MediaAnalysis = {
      type: 'video',
      hasAudio: true,
      contentSafe: true,
      quality: 'medium'
    };

    // In a real implementation, you would:
    // 1. Extract video metadata using ffprobe
    // 2. Generate thumbnail at specific timestamp
    // 3. Extract audio track if needed
    // 4. Transcode to different formats/resolutions

    return { derivatives, analysis, metadata };
  }

  private async processAudio(
    buffer: Buffer,
    orgId: string,
    id: string,
    filename: string
  ): Promise<{
    derivatives: DerivativeMap;
    analysis: MediaAnalysis;
    metadata: Partial<MediaMetadata>;
  }> {
    const derivatives: DerivativeMap = {};

    const metadata: Partial<MediaMetadata> = {
      format: filename.split('.').pop() || 'mp3'
    };

    const analysis: MediaAnalysis = {
      type: 'audio',
      contentSafe: true,
      quality: 'medium'
    };

    // In a real implementation, you would:
    // 1. Extract audio metadata using ffprobe
    // 2. Normalize audio levels
    // 3. Convert to different formats (mp3, aac, etc.)

    return { derivatives, analysis, metadata };
  }

  async getMediaInfo(buffer: Buffer, mimeType: string): Promise<MediaMetadata> {
    const mediaType = this.getMediaType(mimeType);

    if (mediaType === 'image') {
      const metadata = await sharp(buffer).metadata();
      return {
        filename: '',
        mimeType,
        size: buffer.length,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format || 'unknown',
        createdAt: new Date()
      };
    }

    // For video/audio, return basic metadata
    return {
      filename: '',
      mimeType,
      size: buffer.length,
      format: mimeType.split('/')[1] || 'unknown',
      createdAt: new Date()
    };
  }
}
