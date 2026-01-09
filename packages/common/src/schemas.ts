/**
 * Common validation schemas for ViVi CMO Agent
 */

import { z } from 'zod';

// User and organization schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  orgId: z.string().uuid(),
  role: z.enum(['admin', 'user', 'viewer']),
  auth0Id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  planTier: z.enum(['LITE', 'PLUS', 'PRO', 'PRIME']),
  settings: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Media and content schemas
export const MediaAssetSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  type: z.enum(['image', 'video', 'audio', 'document']),
  url: z.string().url(),
  filename: z.string(),
  size: z.number().positive(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date()
});

export const ContentSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  platform: z.enum(['instagram', 'facebook', 'google_business', 'tiktok', 'linkedin', 'youtube_shorts']),
  type: z.enum(['post', 'story', 'reel', 'ad']),
  content: z.string(),
  mediaAssets: z.array(z.string().uuid()).optional(),
  scheduledFor: z.date().optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'failed']),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Campaign and analytics schemas
export const CampaignSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed']),
  budget: z.number().positive().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const AnalyticsSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  contentId: z.string().uuid().optional(),
  campaignId: z.string().uuid().optional(),
  metrics: z.record(z.number()),
  date: z.date(),
  platform: z.enum(['instagram', 'facebook', 'google_business', 'tiktok', 'linkedin', 'youtube_shorts']).optional()
});

// AI and ML schemas
export const AIPromptSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  prompt: z.string().min(1),
  response: z.string().optional(),
  model: z.string(),
  tokens: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  createdAt: z.date()
});

export const LearningLoopSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  type: z.enum(['content_optimization', 'audience_targeting', 'timing_optimization']),
  status: z.enum(['active', 'paused', 'completed']),
  metrics: z.record(z.number()),
  adjustments: z.array(z.record(z.any())),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Export all schemas
export const CommonSchemas = {
  User: UserSchema,
  Organization: OrganizationSchema,
  MediaAsset: MediaAssetSchema,
  Content: ContentSchema,
  Campaign: CampaignSchema,
  Analytics: AnalyticsSchema,
  AIPrompt: AIPromptSchema,
  LearningLoop: LearningLoopSchema
};
