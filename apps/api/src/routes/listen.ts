import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { inboundEvents, mentions, classifications, assignments } from '../db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '../middleware/auth';
import { EntitlementsService, Feature } from '@vivi/entitlements';
import { PlanTier } from '@vivi/common';

const router: Router = Router();

// Webhook ingestion
router.post('/webhooks/:provider', async (req: Request, res: Response, next) => {
  try {
    const { orgId } = req.body;
    const { provider } = req.params;
    const payload = req.body;
    
    // Validate provider
    const validProviders = ['instagram', 'facebook', 'google_business', 'tiktok', 'linkedin', 'youtube_shorts'];
    if (!validProviders.includes(provider)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid provider specified'
      });
    }
    
    // Store inbound event
    await db.insert(inboundEvents).values({
      orgId,
      provider: provider as any,
      payload
    });
    
    // TODO: Queue for processing
    // await queue.add('listen.webhook', { orgId, provider, payload });
    
    res.status(200).json({
      message: 'Webhook received and queued',
      provider,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Listen digest (Lite)
router.get('/digest', async (req: Request, res: Response, next) => {
  try {
    const { orgId, planTier } = req.body;
    
    // Check entitlement
    if (!EntitlementsService.hasFeatureForPlan(planTier as PlanTier, Feature.LISTEN_DIGEST)) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: 'Listen digest not available on your plan tier'
      });
    }
    
    // TODO: Implement digest generation logic
    const digest = {
      summary: 'Daily activity summary',
      mentions: 5,
      sentiment: 'positive',
      topTopics: ['customer service', 'product feedback'],
      recommendations: ['Respond to negative reviews', 'Engage with positive mentions']
    };
    
    res.json({
      digest,
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Listen inbox (Plus+)
router.get('/inbox', async (req: Request, res: Response, next) => {
  try {
    const { orgId, planTier } = req.body;
    
    // Check entitlement
    if (!EntitlementsService.hasFeatureForPlan(planTier as PlanTier, Feature.LISTEN_INBOX)) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: 'Listen inbox not available on your plan tier'
      });
    }
    
    // TODO: Implement inbox logic
    const inbox = {
      unread: 12,
      mentions: 8,
      reviews: 4,
      priority: ['urgent_response_needed', 'high_engagement_opportunity']
    };
    
    res.json({
      inbox,
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Assign item
router.post('/assign', async (req: Request, res: Response, next) => {
  try {
    const { orgId, planTier } = req.body;
    const { itemType, itemId, assigneeId, dueAt } = req.body;
    
    // Check entitlement
    if (!EntitlementsService.hasFeatureForPlan(planTier as PlanTier, Feature.LISTEN_INBOX)) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: 'Assignment features not available on your plan tier'
      });
    }
    
    // Validate input
    const assignSchema = z.object({
      itemType: z.enum(['mention', 'review', 'message']),
      itemId: z.string().uuid(),
      assigneeId: z.string().uuid(),
      dueAt: z.string().datetime().optional()
    });
    
    const validated = assignSchema.parse(req.body);
    
    // Create assignment
    const [assignment] = await db.insert(assignments).values({
      orgId,
      itemType: validated.itemType,
      itemId: validated.itemId,
      assigneeId: validated.assigneeId,
      dueAt: validated.dueAt ? new Date(validated.dueAt) : undefined,
      status: 'pending'
    }).returning();
    
    res.status(201).json({
      message: 'Item assigned successfully',
      assignment,
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Reply to item
router.post('/reply', async (req: Request, res: Response, next) => {
  try {
    const { orgId, planTier } = req.body;
    const { itemType, itemId, reply, tone } = req.body;
    
    // Check entitlement
    if (!EntitlementsService.hasFeatureForPlan(planTier as PlanTier, Feature.LISTEN_INBOX)) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: 'Reply features not available on your plan tier'
      });
    }
    
    // TODO: Implement reply logic
    res.json({
      message: 'Reply generated successfully',
      itemType,
      itemId,
      reply,
      tone,
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

export default router;
