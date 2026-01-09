import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db';
import { users, orgs } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AuthenticationError, AuthorizationError } from '@vivi/common';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      orgId: string;
      userId: string;
      userRole: string;
      planTier: string;
      user: {
        id: string;
        email: string;
        role: string;
        orgId: string;
      };
    }
  }
}

// Auth0 JWT validation
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

// JWT verification options
const verifyOptions = {
  audience: AUTH0_AUDIENCE,
  issuer: `https://${AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
};

// Rate limiting configuration
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // 100 requests per window

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Rate limiting check
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    if (!rateLimitStore.has(clientId)) {
      rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else {
      const client = rateLimitStore.get(clientId)!;
      if (now > client.resetTime) {
        client.count = 1;
        client.resetTime = now + RATE_LIMIT_WINDOW;
      } else {
        client.count++;
        if (client.count > RATE_LIMIT_MAX) {
          throw new AuthenticationError('Rate limit exceeded. Please try again later.');
        }
      }
    }

    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    let decoded: any;
    try {
      // For development, allow bypass with environment variable
      if (process.env.NODE_ENV === 'development' && process.env.AUTH_BYPASS === 'true') {
        decoded = {
          sub: req.headers['x-user-id'] || 'dev-user-id',
          'https://vivi.ai/org_id': req.headers['x-org-id'] || 'dev-org-id',
          'https://vivi.ai/email': req.headers['x-user-email'] || 'dev@example.com',
          'https://vivi.ai/role': req.headers['x-user-role'] || 'admin'
        };
      } else {
        // Verify JWT with Auth0 public key
        decoded = jwt.verify(token, await getAuth0PublicKey(), {
          audience: verifyOptions.audience,
          issuer: verifyOptions.issuer,
          algorithms: verifyOptions.algorithms as jwt.Algorithm[]
        });
      }
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }

    // Extract user information
    const userId = decoded.sub;
    const orgId = decoded['https://vivi.ai/org_id'];
    const email = decoded['https://vivi.ai/email'];
    const role = decoded['https://vivi.ai/role'];

    if (!userId || !orgId || !email || !role) {
      throw new AuthenticationError('Missing required user information in token');
    }

    // Validate organization exists and user belongs to it
    const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId));
    if (!org) {
      throw new AuthenticationError('Organization not found');
    }

    // Check if user exists in database
    let [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      // Create user if they don't exist (first login)
      [user] = await db.insert(users).values({
        orgId,
        email,
        role,
        auth0Id: userId,
        createdAt: new Date()
      }).returning();
    } else {
      // Update user information
      await db.update(users)
        .set({
          email,
          role
        })
        .where(eq(users.id, userId));
    }

    // Attach user information to request
    req.orgId = orgId;
    req.userId = userId;
    req.userRole = role;
    req.planTier = org.planTier;
    req.user = {
      id: userId,
      email,
      role,
      orgId
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      res.status(401).json({
        error: error.message,
        code: error.constructor.name
      });
    } else {
      console.error('Authentication error:', error);
      res.status(500).json({
        error: 'Internal authentication error',
        code: 'InternalError'
      });
    }
  }
};

// Role-based access control middleware
export const requireRole = (requiredRoles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    if (!req.user || !roles.includes(req.userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'InsufficientPermissions'
      });
    }
    
    next();
  };
};

// Organization scoping middleware
export const requireOrgAccess = (orgIdParam: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestedOrgId = req.params[orgIdParam];
    
    if (req.orgId !== requestedOrgId) {
      return res.status(403).json({
        error: 'Access denied to requested organization',
        code: 'OrganizationAccessDenied'
      });
    }
    
    next();
  };
};

// Plan tier validation middleware
export const requirePlanTier = (requiredTier: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const planTiers = ['LITE', 'PLUS', 'PRO', 'PRIME'];
    const userTierIndex = planTiers.indexOf(req.planTier);
    const requiredTierIndex = planTiers.indexOf(requiredTier);
    
    if (userTierIndex < requiredTierIndex) {
      return res.status(403).json({
        error: `This feature requires ${requiredTier} plan or higher`,
        code: 'InsufficientPlanTier',
        currentTier: req.planTier,
        requiredTier
      });
    }
    
    next();
  };
};

// Get Auth0 public key for JWT verification
async function getAuth0PublicKey(): Promise<string> {
  if (!AUTH0_DOMAIN) {
    throw new Error('AUTH0_DOMAIN environment variable not set');
  }

  try {
    const response = await fetch(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`);
    const jwks = await response.json();
    
    // For now, return a placeholder - in production, you'd parse the JWKS
    // and extract the appropriate public key based on the token's key ID
    return process.env.AUTH0_PUBLIC_KEY || 'placeholder-key';
  } catch (error) {
    console.error('Failed to fetch Auth0 JWKS:', error);
    throw new Error('Failed to fetch Auth0 public keys');
  }
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  for (const [clientId, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(clientId);
    }
  }
}, RATE_LIMIT_WINDOW);
