import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { MediaJobData } from '../jobs/queue-manager';
import { QueueManager } from '../jobs/queue-manager';

// File validation schema
const FileValidationSchema = z.object({
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number().max(100 * 1024 * 1024), // 100MB max
    buffer: z.instanceof(Buffer),
    destination: z.string().optional(),
    filename: z.string().optional(),
    path: z.string().optional()
  })
});

// Allowed file types
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  
  // Videos
  'video/mp4',
  'video/mov',
  'video/avi',
  'video/mkv',
  'video/webm',
  'video/quicktime',
  
  // Audio
  'audio/mp3',
  'audio/wav',
  'audio/m4a',
  'audio/aac',
  'audio/ogg',
  'audio/flac'
];

// File size limits by type
const FILE_SIZE_LIMITS = {
  'image': 50 * 1024 * 1024, // 50MB for images
  'video': 100 * 1024 * 1024, // 100MB for videos
  'audio': 25 * 1024 * 1024   // 25MB for audio
};

// Configure multer
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
    return;
  }

  // Check file size based on type
  const fileType = file.mimetype.split('/')[0];
  const sizeLimit = FILE_SIZE_LIMITS[fileType as keyof typeof FILE_SIZE_LIMITS] || FILE_SIZE_LIMITS.image;
  
  if (file.size > sizeLimit) {
    cb(new Error(`File size ${file.size} bytes exceeds limit of ${sizeLimit} bytes for ${fileType} files`));
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB global limit
    files: 1, // Only one file at a time
    fields: 5 // Allow up to 5 additional fields
  }
});

// Middleware to validate uploaded file and add to queue
export const processUpload = (queueManager: QueueManager) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          code: 'NoFileUploaded'
        });
      }

      // Validate file data
      const validationResult = FileValidationSchema.safeParse({ file: req.file });
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid file data',
          code: 'InvalidFileData',
          details: validationResult.error.errors
        });
      }

      const file = req.file;
      
      // Create job data
      const jobData: MediaJobData = {
        orgId: req.orgId,
        userId: req.userId,
        file: file.buffer,
        metadata: {
          filename: file.filename || file.originalname,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          encoding: file.encoding
        }
      };

      // Add to media processing queue
      const job = await queueManager.addMediaIngestJob(jobData);

      // Return immediate response with job ID
      res.status(202).json({
        message: 'File uploaded successfully and queued for processing',
        jobId: job.id,
        status: 'processing',
        estimatedTime: '2-5 minutes',
        file: {
          originalName: file.originalname,
          size: file.size,
          type: file.mimetype
        }
      });

    } catch (error) {
      console.error('File upload processing error:', error);
      res.status(500).json({
        error: 'Failed to process uploaded file',
        code: 'FileProcessingError',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
};

// Middleware to check upload progress
export const checkUploadProgress = (queueManager: QueueManager) => {
  return async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      
      if (!jobId) {
        return res.status(400).json({
          error: 'Job ID is required',
          code: 'MissingJobId'
        });
      }

      // Get job status from queue
      const queue = queueManager['queues'].get('media.ingest');
      if (!queue) {
        return res.status(500).json({
          error: 'Media processing queue not available',
          code: 'QueueUnavailable'
        });
      }

      const job = await queue.getJob(jobId);
      if (!job) {
        return res.status(404).json({
          error: 'Job not found',
          code: 'JobNotFound'
        });
      }

      const state = await job.getState();
      const progress = job.progress;
      const result = job.returnvalue;
      const failedReason = job.failedReason;

      res.json({
        jobId,
        state,
        progress,
        result,
        failedReason,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Job status check error:', error);
      res.status(500).json({
        error: 'Failed to check job status',
        code: 'StatusCheckError',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
};
