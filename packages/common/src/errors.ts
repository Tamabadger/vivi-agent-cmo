export class ViViError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ViViError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400);
    this.details = details;
  }
  
  public readonly details?: any;
}

export class AuthenticationError extends ViViError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends ViViError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends ViViError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, 'NOT_FOUND_ERROR', 404);
  }
}

export class EntitlementError extends ViViError {
  constructor(feature: string, plan: string) {
    super(`Feature ${feature} not available on ${plan} plan`, 'ENTITLEMENT_ERROR', 403);
  }
}

export class QuotaExceededError extends ViViError {
  constructor(feature: string, limit: number) {
    super(`Quota exceeded for ${feature}. Limit: ${limit}`, 'QUOTA_EXCEEDED_ERROR', 429);
  }
}

export class RateLimitError extends ViViError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
  }
}

export class ExternalServiceError extends ViViError {
  constructor(service: string, message: string) {
    super(`External service error (${service}): ${message}`, 'EXTERNAL_SERVICE_ERROR', 502);
  }
}

export class MediaProcessingError extends ViViError {
  constructor(message: string) {
    super(`Media processing error: ${message}`, 'MEDIA_PROCESSING_ERROR', 422);
  }
}

export class ComplianceError extends ViViError {
  constructor(message: string) {
    super(`Compliance error: ${message}`, 'COMPLIANCE_ERROR', 422);
  }
}
