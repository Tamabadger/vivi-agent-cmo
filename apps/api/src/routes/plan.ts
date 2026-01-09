import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { mediaAssets, captionSuggestions, scheduledPosts } from '../db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { auth } from '../middleware/auth';
import { EntitlementsService, Feature } from '@vivi/entitlements';
import { PlanTier, Platform } from '@vivi/common';

const router: Router = Router();

// Generate caption variants
router.post('/variants', async (req: Request, res, next) => {
  try {
    const { orgId, planTier } = req;
    const { assetId, platforms } = req.body;
    
    // Validate input
    const variantsSchema = z.object({
      assetId: z.string().uuid(),
      platforms: z.array(z.enum(['instagram', 'facebook', 'google_business', 'tiktok', 'linkedin', 'youtube_shorts']))
    });
    
    const validated = variantsSchema.parse(req.body);
    
    // Check entitlements
    const maxVariants = EntitlementsService.getCaptionVariants(planTier as PlanTier);
    const supportedPlatforms = validated.platforms.filter(platform => 
      EntitlementsService.supportsPlatform(planTier as PlanTier, platform)
    );
    
    if (supportedPlatforms.length === 0) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: 'No supported platforms for your plan tier'
      });
    }
    
    // TODO: Implement LLM caption generation
    // For now, return placeholder variants
    const variants = [];
    
    for (const platform of supportedPlatforms) {
      for (let i = 0; i < maxVariants; i++) {
        variants.push({
          platform,
          variantIdx: i,
          caption: `Generated caption for ${platform} - variant ${i + 1}`,
          hashtags: [`#${platform}`, `#variant${i + 1}`],
          complianceNotes: {}
        });
      }
    }
    
    res.json({
      variants,
      maxVariants,
      supportedPlatforms,
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Schedule a post
router.post('/schedule', async (req: Request, res, next) => {
  try {
    const { orgId, planTier } = req;
    const { platform, assetId, caption, scheduledFor, boostLevel = 0 } = req.body;
    
    // Validate input
    const scheduleSchema = z.object({
      platform: z.enum(['instagram', 'facebook', 'google_business', 'tiktok', 'linkedin', 'youtube_shorts']),
      assetId: z.string().uuid(),
      caption: z.string().min(1),
      scheduledFor: z.string().datetime(),
      boostLevel: z.number().min(0).max(3).optional()
    });
    
    const validated = scheduleSchema.parse(req.body);
    
    // Check platform support
    if (!EntitlementsService.supportsPlatform(planTier as PlanTier, validated.platform)) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: `Platform ${validated.platform} not supported on ${planTier} plan`
      });
    }
    
    // Check scheduler limits
    const schedulerLimit = EntitlementsService.getSchedulerLimit(planTier as PlanTier);
    if (schedulerLimit !== null) {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const monthStart = new Date(currentMonth + '-01');
      const monthEnd = new Date(currentMonth + '-31');
      
      const monthlyPosts = await db.select()
        .from(scheduledPosts)
        .where(and(
          eq(scheduledPosts.orgId, orgId),
          gte(scheduledPosts.scheduledFor, monthStart),
          lte(scheduledPosts.scheduledFor, monthEnd)
        ));
      
      if (monthlyPosts.length >= schedulerLimit) {
        return res.status(429).json({
          error: 'QUOTA_EXCEEDED_ERROR',
          message: `Monthly scheduler limit of ${schedulerLimit} posts exceeded`,
          limit: schedulerLimit,
          used: monthlyPosts.length
        });
      }
    }
    
    // Check boost level entitlement
    if (validated.boostLevel && validated.boostLevel > 0 && !EntitlementsService.hasFeatureForPlan(planTier as PlanTier, Feature.BOOST_ENGINE)) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: 'Boost Engine not available on your plan tier'
      });
    }
    
    // Create scheduled post
    const [scheduledPost] = await db.insert(scheduledPosts)
      .values({
        orgId,
        platform: validated.platform,
        assetId: validated.assetId,
        caption: validated.caption,
        scheduledFor: new Date(validated.scheduledFor),
        boostLevel: validated.boostLevel as any,
        status: 'draft'
      })
      .returning();
    
    res.status(201).json({
      message: 'Post scheduled successfully',
      scheduledPost,
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Bulk schedule posts
router.post('/schedule/bulk', async (req: Request, res, next) => {
  try {
    const { orgId, planTier } = req;
    const { posts } = req.body;
    
    // Validate input
    const bulkScheduleSchema = z.object({
      posts: z.array(z.object({
        platform: z.enum(['instagram', 'facebook', 'google_business', 'tiktok', 'linkedin', 'youtube_shorts']),
        assetId: z.string().uuid(),
        caption: z.string().min(1),
        scheduledFor: z.string().datetime(),
        boostLevel: z.number().min(0).max(3).optional()
      })).min(1).max(10) // Limit bulk operations
    });
    
    const validated = bulkScheduleSchema.parse(req.body);
    
    // Check entitlements and limits
    const schedulerLimit = EntitlementsService.getSchedulerLimit(planTier as PlanTier);
    if (schedulerLimit !== null) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthStart = new Date(currentMonth + '-01');
      const monthEnd = new Date(currentMonth + '-31');
      
      const monthlyPosts = await db.select()
        .from(scheduledPosts)
        .where(and(
          eq(scheduledPosts.orgId, orgId),
          gte(scheduledPosts.scheduledFor, monthStart),
          lte(scheduledPosts.scheduledFor, monthEnd)
        ));
      
      if (monthlyPosts.length + validated.posts.length > schedulerLimit) {
        return res.status(429).json({
          error: 'QUOTA_EXCEEDED_ERROR',
          message: `Bulk schedule would exceed monthly limit of ${schedulerLimit}`,
          limit: schedulerLimit,
          current: monthlyPosts.length,
          requested: validated.posts.length
        });
      }
    }
    
    // Validate each post
    const validPosts = [];
    const errors = [];
    
    for (let i = 0; i < validated.posts.length; i++) {
      const post = validated.posts[i];
      
      if (!EntitlementsService.supportsPlatform(planTier as PlanTier, post.platform)) {
        errors.push(`Post ${i + 1}: Platform ${post.platform} not supported on ${planTier} plan`);
        continue;
      }
      
      if (post.boostLevel && post.boostLevel > 0 && !EntitlementsService.hasFeatureForPlan(planTier as PlanTier, Feature.BOOST_ENGINE)) {
        errors.push(`Post ${i + 1}: Boost Engine not available on your plan tier`);
        continue;
      }
      
      validPosts.push(post);
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Some posts could not be scheduled',
        errors,
        validPosts: validPosts.length
      });
    }
    
    // Prepare data for bulk insert
    const scheduledPostsData = validated.posts.map(post => ({
      orgId,
      platform: post.platform,
      assetId: post.assetId,
      caption: post.caption,
      scheduledFor: new Date(post.scheduledFor),
      boostLevel: (post.boostLevel || 0) as any,
      status: 'draft' as const
    }));
    
    const insertedPosts = await db.insert(scheduledPosts)
      .values(scheduledPostsData)
      .returning();
    
    res.status(201).json({
      message: `Successfully scheduled ${insertedPosts.length} posts`,
      scheduledPosts: insertedPosts,
      errors: errors.length > 0 ? errors : undefined,
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Boost optimization (Pro+)
router.post('/boost', async (req: Request, res, next) => {
  try {
    const { orgId, planTier } = req;
    const { scheduledPostId, level } = req.body;
    
    // Check entitlement
    if (!EntitlementsService.hasFeatureForPlan(planTier as PlanTier, Feature.BOOST_ENGINE)) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: 'Boost Engine not available on your plan tier'
      });
    }
    
    // Validate input
    const boostSchema = z.object({
      scheduledPostId: z.string().uuid(),
      level: z.enum(['1', '2', '3'])
    });
    
    const validated = boostSchema.parse(req.body);
    
    // TODO: Implement boost optimization logic
    const diffs = {
      caption: `Optimized caption for boost level ${validated.level}`,
      hashtags: [`#boost${validated.level}`, `#optimized`],
      timing: `Optimized timing for ${validated.level}x engagement`
    };
    
    const rationale = `Boost level ${validated.level} optimization applied based on historical performance data and audience insights.`;
    
    res.json({
      message: 'Boost optimization completed',
      level: validated.level,
      diffs,
      rationale,
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// A/B testing (Pro+)
router.post('/ab-tests', async (req: Request, res, next) => {
  try {
    const { orgId, planTier } = req;
    const { subjectType, subjectId, variants } = req.body;
    
    // Check entitlement
    if (!EntitlementsService.hasFeatureForPlan(planTier as PlanTier, Feature.AB_TESTS)) {
      return res.status(403).json({
        error: 'ENTITLEMENT_ERROR',
        message: 'A/B Testing not available on your plan tier'
      });
    }
    
    // Validate input
    const abTestSchema = z.object({
      subjectType: z.enum(['caption', 'hashtags', 'thumbnail', 'timing']),
      subjectId: z.string().uuid(),
      variants: z.array(z.record(z.any())).min(2).max(5)
    });
    
    const validated = abTestSchema.parse(req.body);
    
    // TODO: Implement A/B test creation
    res.json({
      message: 'A/B test created successfully',
      subjectType: validated.subjectType,
      subjectId: validated.subjectId,
      variants: validated.variants.length,
      status: 'running',
      planTier,
      orgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

export default router;
