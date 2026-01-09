import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { logger } from '../utils/logger';

/**
 * Generic validation middleware using Zod schemas
 */
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers
      });
      
      // Attach validated data to request
      (req as any).validated = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        logger.warn('Validation failed', {
          path: req.path,
          method: req.method,
          errors: validationErrors
        });
        
        return res.status(400).json({
          error: 'VALIDATION_FAILED',
          message: 'Request validation failed',
          details: validationErrors
        });
      }
      
      logger.error('Unexpected validation error', { error });
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred during validation'
      });
    }
  };
}

/**
 * Rate limiting middleware
 */
export function rateLimit(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    const userRequests = requests.get(key);
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      });
      return next();
    }
    
    if (userRequests.count >= options.maxRequests) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: options.message || 'Too many requests, please try again later',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
      });
    }
    
    userRequests.count++;
    next();
  };
}

/**
 * Input sanitization middleware
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  
  return sanitized;
}

/**
 * Sanitize string input
 */
function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 10000); // Limit string length
}

/**
 * Content type validation middleware
 */
export function validateContentType(allowedTypes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('content-type');
    
    if (!contentType) {
      return res.status(400).json({
        error: 'MISSING_CONTENT_TYPE',
        message: 'Content-Type header is required'
      });
    }
    
    const isValid = allowedTypes.some(type => 
      contentType.includes(type)
    );
    
    if (!isValid) {
      return res.status(415).json({
        error: 'UNSUPPORTED_CONTENT_TYPE',
        message: `Content-Type must be one of: ${allowedTypes.join(', ')}`,
        received: contentType
      });
    }
    
    next();
  };
}

/**
 * File size validation middleware
 */
export function validateFileSize(maxSizeBytes: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    
    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        error: 'FILE_TOO_LARGE',
        message: `File size exceeds maximum allowed size of ${Math.round(maxSizeBytes / 1024 / 1024)}MB`,
        maxSize: maxSizeBytes,
        received: contentLength
      });
    }
    
    next();
  };
}

/**
 * Authentication validation middleware
 */
export function validateAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.get('authorization');
  
  if (!authHeader) {
    return res.status(401).json({
      error: 'MISSING_AUTH',
      message: 'Authorization header is required'
    });
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'INVALID_AUTH_FORMAT',
      message: 'Authorization header must use Bearer token format'
    });
  }
  
  const token = authHeader.substring(7);
  
  if (!token || token.length < 10) {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Token appears to be invalid'
    });
  }
  
  // Token validation would happen here in production
  // For now, just pass through
  next();
}

/**
 * Organization validation middleware
 */
export function validateOrgAccess(req: Request, res: Response, next: NextFunction) {
  const orgId = req.params.orgId || req.body.orgId || req.query.orgId;
  
  if (!orgId) {
    return res.status(400).json({
      error: 'MISSING_ORG_ID',
      message: 'Organization ID is required'
    });
  }
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(orgId)) {
    return res.status(400).json({
      error: 'INVALID_ORG_ID',
      message: 'Organization ID must be a valid UUID'
    });
  }
  
  // Organization access validation would happen here in production
  // For now, just pass through
  next();
}

/**
 * Error handling middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  // Don't expose internal errors to client
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: err.message,
      details: isDevelopment ? err.stack : undefined
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }
  
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Access denied'
    });
  }
  
  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: 'Resource not found'
    });
  }
  
  // Default error response
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    details: isDevelopment ? err.stack : undefined
  });
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
}
