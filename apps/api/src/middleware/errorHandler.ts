import { Request, Response, NextFunction } from 'express';
import { ViViError } from '@vivi/common';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.headers['x-request-id'];
  
  // Log error
  console.error(`[${requestId}] Error:`, {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Handle ViVi errors
  if (error instanceof ViViError) {
    return res.status(error.statusCode).json({
      error: error.code,
      message: error.message,
      requestId,
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: error.message,
      requestId,
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle unknown errors
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;
  
  res.status(statusCode).json({
    error: 'INTERNAL_SERVER_ERROR',
    message,
    requestId,
    timestamp: new Date().toISOString()
  });
};
