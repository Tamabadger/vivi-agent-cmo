import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { missions, missionSteps, approvals, competitors, competitorSignals } from '../db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '../middleware/auth';
import { EntitlementsService, Feature } from '@vivi/entitlements';
import { PlanTier } from '@vivi/common';
import { and } from 'drizzle-orm';

const router: Router = Router();

// Toggle Sentry mode
router.post('/toggle', async (req: Request, res: Response, next) => {
  try {
    const { orgId, planTier } = req.body;
    const { on, mode } = req.body;
    
    // Check entitlement
    if (!EntitlementsService.hasFeatureForPlan(planTier as PlanTier, Feature.SENTRY_MODE)) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: 'Sentry Mode not available on your plan tier'
      });
    }
    
    // Validate input
    const toggleSchema = z.object({
      on: z.boolean(),
      mode: z.enum(['dry-run', 'auto']).optional()
    });
    
    const validated = toggleSchema.parse(req.body);
    
    // TODO: Implement Sentry mode toggle logic
    const sentryStatus = {
      enabled: validated.on,
      mode: validated.mode || 'dry-run',
      timestamp: new Date().toISOString()
    };
    
    res.json({
      message: `Sentry Mode ${validated.on ? 'enabled' : 'disabled'}`,
      status: sentryStatus,
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Get missions
router.get('/missions', async (req: Request, res: Response, next) => {
  try {
    const { orgId, planTier } = req.body;
    
    // Check entitlement
    if (!EntitlementsService.hasFeatureForPlan(planTier as PlanTier, Feature.SENTRY_MODE)) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: 'Sentry Mode not available on your plan tier'
      });
    }
    
    // Get missions for org
    const orgMissions = await db.select()
      .from(missions)
      .where(eq(missions.orgId, orgId))
      .orderBy(missions.startedAt);
    
    res.json({
      missions: orgMissions,
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Get mission log (SSE/WebSocket stream)
router.get('/missions/:id/log', async (req: Request, res: Response, next) => {
  try {
    const { orgId, planTier } = req.body;
    const { id } = req.params;
    
    // Check entitlement
    if (!EntitlementsService.hasFeatureForPlan(planTier as PlanTier, Feature.MISSION_LOG_REALTIME)) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: 'Real-time mission logs not available on your plan tier'
      });
    }
    
    // Verify mission exists and belongs to org
    const [mission] = await db.select()
      .from(missions)
      .where(and(eq(missions.id, id), eq(missions.orgId, orgId)))
      .limit(1);
    
    if (!mission) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Mission not found'
      });
    }
    
    // Set up SSE for mission log streaming
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    
    // TODO: Implement real-time mission log streaming
    const streamMissionLog = async () => {
      const steps = [
        { step: 1, status: 'completed', message: 'Mission initialized' },
        { step: 2, status: 'running', message: 'Analyzing context...' },
        { step: 3, status: 'pending', message: 'Planning actions...' }
      ];
      
      for (const step of steps) {
        res.write(`data: ${JSON.stringify(step)}\n\n`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      res.end();
    };
    
    streamMissionLog();
    
  } catch (error) {
    next(error);
  }
});

// Approve mission
router.post('/missions/:id/approve', async (req: Request, res: Response, next) => {
  try {
    const { orgId, planTier } = req.body;
    const { id } = req.params;
    const { approved, notes } = req.body;
    
    // Check entitlement
    if (!EntitlementsService.hasFeatureForPlan(planTier as PlanTier, Feature.POLICY_APPROVAL_ENGINE)) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: 'Policy approval engine not available on your plan tier'
      });
    }
    
    // Validate input
    const approvalSchema = z.object({
      approved: z.boolean(),
      notes: z.string().optional()
    });
    
    const validated = approvalSchema.parse(req.body);
    
    // TODO: Implement mission approval logic
    res.json({
      message: `Mission ${validated.approved ? 'approved' : 'rejected'}`,
      missionId: id,
      approved: validated.approved,
      notes: validated.notes,
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Get competitor signals
router.get('/competitors/signals', async (req: Request, res: Response, next) => {
  try {
    const { orgId, planTier } = req.body;
    
    // Check entitlement
    if (!EntitlementsService.hasFeatureForPlan(planTier as PlanTier, Feature.COMPETITOR_INTELLIGENCE)) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: 'Competitor intelligence not available on your plan tier'
      });
    }
    
    // TODO: Implement competitor signal aggregation
    const signals = [
      {
        competitor: 'Competitor A',
        platform: 'instagram',
        signals: ['New product launch', 'Increased ad spend'],
        impact: 'medium'
      }
    ];
    
    res.json({
      signals,
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Governance policies
router.post('/governance/policies', async (req: Request, res: Response, next) => {
  try {
    const { orgId, planTier } = req.body;
    const { policyType, rules } = req.body;
    
    // Check entitlement
    if (!EntitlementsService.hasFeatureForPlan(planTier as PlanTier, Feature.POLICY_APPROVAL_ENGINE)) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: 'Governance policies not available on your plan tier'
      });
    }
    
    // TODO: Implement governance policy management
    res.json({
      message: 'Governance policy updated successfully',
      policyType,
      rules,
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

export default router;
