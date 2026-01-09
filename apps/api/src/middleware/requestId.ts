import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithId extends Request {
  id: string;
}

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  // Generate or use existing request ID
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  
  // Attach to request object
  (req as RequestWithId).id = requestId;
  
  // Add to response headers
  res.setHeader('x-request-id', requestId);
  
  next();
};
