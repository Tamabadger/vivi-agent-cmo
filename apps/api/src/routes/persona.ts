import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { personaProfiles, toneProfiles, policies } from '../db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '../middleware/auth';
import { EntitlementsService, Feature } from '@vivi/entitlements';
import { PlanTier } from '@vivi/common';

const router: Router = Router();

// Get persona profile
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { orgId } = req.body;
    
    const [persona] = await db.select()
      .from(personaProfiles)
      .where(eq(personaProfiles.orgId, orgId))
      .limit(1);
    
    const [tone] = await db.select()
      .from(toneProfiles)
      .where(eq(toneProfiles.orgId, orgId))
      .limit(1);
    
    if (!persona) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Persona profile not found. Complete onboarding first.'
      });
    }
    
    res.json({
      persona,
      tone,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Update persona profile
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const { orgId } = req.body;
    const { industry, locale, brandValues, objectives } = req.body;
    
    // Validate input
    const updateSchema = z.object({
      industry: z.string().min(1).optional(),
      locale: z.string().min(1).optional(),
      brandValues: z.array(z.string()).min(1).optional(),
      objectives: z.array(z.string()).min(1).optional()
    });
    
    const validated = updateSchema.parse(req.body);
    
    // Update or create persona profile
    await db.insert(personaProfiles)
      .values({
        orgId,
        industry: validated.industry || 'general',
        locale: validated.locale || 'en',
        brandValues: validated.brandValues || [],
        objectives: validated.objectives || [],
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: personaProfiles.orgId,
        set: {
          industry: validated.industry,
          locale: validated.locale,
          brandValues: validated.brandValues,
          objectives: validated.objectives,
          updatedAt: new Date()
        }
      });
    
    res.json({
      message: 'Persona profile updated successfully',
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Get policies
router.get('/policies', async (req: Request, res: Response, next) => {
  try {
    const { orgId } = req.body;
    
    const orgPolicies = await db.select()
      .from(policies)
      .where(eq(policies.orgId, orgId));
    
    res.json({
      policies: orgPolicies,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Update policies
router.post('/policies', async (req: Request, res: Response, next) => {
  try {
    const { orgId } = req.body;
    const { key, rules } = req.body;
    
    // Validate input
    const policySchema = z.object({
      key: z.string().min(1),
      rules: z.record(z.any())
    });
    
    const validated = policySchema.parse(req.body);
    
    // Update or create policy
    await db.insert(policies)
      .values({
        orgId,
        key: validated.key,
        rules: validated.rules
      })
      .onConflictDoUpdate({
        target: [policies.orgId, policies.key],
        set: {
          rules: validated.rules
        }
      });
    
    res.json({
      message: 'Policy updated successfully',
      key: validated.key,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Get context bundle (persona + policies + entitlements + filters)
router.get('/contextbundle', async (req: Request, res: Response, next) => {
  try {
    const { orgId, planTier } = req.body;
    
    const [persona] = await db.select()
      .from(personaProfiles)
      .where(eq(personaProfiles.orgId, orgId))
      .limit(1);
    
    const [tone] = await db.select()
      .from(toneProfiles)
      .where(eq(toneProfiles.orgId, orgId))
      .limit(1);
    
    const orgPolicies = await db.select()
      .from(policies)
      .where(eq(policies.orgId, orgId));
    
    if (!persona) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Persona profile not found. Complete onboarding first.'
      });
    }
    
    // TODO: Import and use EntitlementsService for features
    const features: string[] = []; // Placeholder
    
    res.json({
      persona,
      tone,
      policies: orgPolicies,
      features,
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

export default router;
