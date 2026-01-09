import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { PlanTier, Platform, MediaType, ContentStatus, Intent, Sentiment, BoostLevel } from '@vivi/common';

// Enums
export const planTierEnum = pgEnum('plan_tier', ['LITE', 'PLUS', 'PRO', 'PRIME']);
export const platformEnum = pgEnum('platform', ['instagram', 'facebook', 'google_business', 'tiktok', 'linkedin', 'youtube_shorts']);
export const mediaTypeEnum = pgEnum('media_type', ['image', 'video', 'audio']);
export const contentStatusEnum = pgEnum('content_status', ['draft', 'scheduled', 'published', 'failed']);
export const intentEnum = pgEnum('intent', ['engagement', 'sales', 'awareness', 'support', 'spam']);
export const sentimentEnum = pgEnum('sentiment', ['positive', 'neutral', 'negative']);
export const boostLevelEnum = pgEnum('boost_level', ['0', '1', '2', '3']);

// Core tables
export const orgs = pgTable('orgs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  planTier: planTierEnum('plan_tier').notNull().default('LITE'),
  timezone: text('timezone').notNull().default('UTC'),
  onboardingComplete: boolean('onboarding_complete').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  email: text('email').notNull(),
  role: text('role').notNull().default('user'),
  auth0Id: text('auth0_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const entitlements = pgTable('entitlements', {
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  featureKey: text('feature_key').notNull(),
  limit: integer('limit'),
  source: text('source').notNull().default('plan')
});

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  subjectType: text('subject_type').notNull(),
  subjectId: text('subject_id').notNull(),
  ts: timestamp('ts').notNull().defaultNow(),
  meta: jsonb('meta')
});

// Onboarding → consciousness
export const onboardingAnswers = pgTable('onboarding_answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  answers: jsonb('answers').notNull(),
  completedAt: timestamp('completed_at')
});

export const personaProfiles = pgTable('persona_profiles', {
  orgId: uuid('org_id').primaryKey().references(() => orgs.id),
  industry: text('industry').notNull(),
  locale: text('locale').notNull(),
  brandValues: jsonb('brand_values').notNull(),
  objectives: jsonb('objectives').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const toneProfiles = pgTable('tone_profiles', {
  orgId: uuid('org_id').primaryKey().references(() => orgs.id),
  sliders: jsonb('sliders').notNull(),
  presets: text('presets').array().notNull().default([])
});

export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  key: text('key').notNull(),
  rules: jsonb('rules').notNull()
});

export const featureQuotas = pgTable('feature_quotas', {
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  key: text('key').notNull(),
  used: integer('used').notNull().default(0),
  period: text('period').notNull()
});

// Media/plan
export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  type: mediaTypeEnum('type').notNull(),
  uri: text('uri').notNull(),
  metadata: jsonb('metadata').notNull().default('{}'),
  analysisJson: jsonb('analysis_json').notNull().default('{}'),
  derivatives: jsonb('derivatives').notNull().default('{}'),
  language: text('language').notNull().default('en')
});

export const captionSuggestions = pgTable('caption_suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  assetId: uuid('asset_id').notNull().references(() => mediaAssets.id),
  platform: platformEnum('platform').notNull(),
  variantIdx: integer('variant_idx').notNull(),
  caption: text('caption').notNull(),
  hashtags: text('hashtags').array().notNull().default([]),
  complianceNotes: jsonb('compliance_notes').notNull().default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const scheduledPosts = pgTable('scheduled_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  platform: platformEnum('platform').notNull(),
  assetId: uuid('asset_id').notNull().references(() => mediaAssets.id),
  caption: text('caption').notNull(),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
  boostLevel: boostLevelEnum('boost_level').notNull().default('0'),
  status: contentStatusEnum('status').notNull().default('draft')
});

export const publishAttempts = pgTable('publish_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  scheduledPostId: uuid('scheduled_post_id').notNull().references(() => scheduledPosts.id),
  attemptNo: integer('attempt_no').notNull(),
  status: text('status').notNull(),
  providerPostId: text('provider_post_id'),
  error: jsonb('error'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// TrendTap & Listen
export const trendCache = pgTable('trend_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  vertical: text('vertical').notNull(),
  region: text('region').notNull(),
  weekIso: text('week_iso').notNull(),
  items: jsonb('items').notNull()
});

export const inboundEvents = pgTable('inbound_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  provider: platformEnum('provider').notNull(),
  payload: jsonb('payload').notNull(),
  ts: timestamp('ts').notNull().defaultNow()
});

export const mentions = pgTable('mentions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  provider: platformEnum('provider').notNull(),
  remoteId: text('remote_id').notNull(),
  text: text('text').notNull(),
  author: text('author').notNull(),
  ts: timestamp('ts').notNull().defaultNow()
});

export const classifications = pgTable('classifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  subjectType: text('subject_type').notNull(),
  subjectId: text('subject_id').notNull(),
  intent: intentEnum('intent').notNull(),
  sentiment: sentimentEnum('sentiment').notNull(),
  topic: text('topic').notNull(),
  lang: text('lang').notNull(),
  score: integer('score').notNull()
});

export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  itemType: text('item_type').notNull(),
  itemId: text('item_id').notNull(),
  assigneeId: uuid('assignee_id').references(() => users.id),
  dueAt: timestamp('due_at', { withTimezone: true }),
  status: text('status').notNull().default('pending')
});

// Analytics, health, ROI
export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  subjectType: text('subject_type').notNull(),
  subjectId: text('subject_id').notNull(),
  name: text('name').notNull(),
  ts: timestamp('ts').notNull().defaultNow(),
  props: jsonb('props').notNull().default('{}')
});

export const aggregatesDaily = pgTable('aggregates_daily', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  date: text('date').notNull(),
  metrics: jsonb('metrics').notNull()
});

export const healthSnapshots = pgTable('health_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  scheduledPostId: uuid('scheduled_post_id').notNull().references(() => scheduledPosts.id),
  preflight: jsonb('preflight').notNull().default('{}'),
  early: jsonb('early').notNull().default('{}'),
  score: integer('score')
});

export const roiModels = pgTable('roi_models', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  model: jsonb('model').notNull(),
  lastCalibratedAt: timestamp('last_calibrated_at').notNull().defaultNow()
});

export const roiProjections = pgTable('roi_projections', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  campaignId: text('campaign_id').notNull(),
  p10: jsonb('p10').notNull(),
  p50: jsonb('p50').notNull(),
  p90: jsonb('p90').notNull(),
  asOf: timestamp('as_of').notNull().defaultNow()
});

// Pro/Prime extras
export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  name: text('name').notNull(),
  goal: text('goal').notNull(),
  budgetCents: integer('budget_cents').notNull(),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  status: text('status').notNull().default('draft')
});

export const campaignPosts = pgTable('campaign_posts', {
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id),
  scheduledPostId: uuid('scheduled_post_id').notNull().references(() => scheduledPosts.id),
  variantGroup: text('variant_group').notNull()
});

export const boostPlans = pgTable('boost_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  scheduledPostId: uuid('scheduled_post_id').notNull().references(() => scheduledPosts.id),
  level: boostLevelEnum('level').notNull(),
  diffs: jsonb('diffs').notNull(),
  rationale: text('rationale').notNull()
});

export const abTests = pgTable('ab_tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  subjectType: text('subject_type').notNull(),
  subjectId: text('subject_id').notNull(),
  variants: jsonb('variants').notNull(),
  winnerVariant: text('winner_variant'),
  status: text('status').notNull().default('running'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  stoppedAt: timestamp('stopped_at')
});

// Prime autonomy & governance
export const missions = pgTable('missions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  type: text('type').notNull(),
  status: text('status').notNull().default('pending'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  finishedAt: timestamp('finished_at'),
  score: integer('score'),
  dryRun: boolean('dry_run').notNull().default(true)
});

export const missionSteps = pgTable('mission_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  missionId: uuid('mission_id').notNull().references(() => missions.id),
  stepNo: integer('step_no').notNull(),
  kind: text('kind').notNull(),
  payload: jsonb('payload').notNull(),
  status: text('status').notNull().default('pending'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  finishedAt: timestamp('finished_at'),
  costCents: integer('cost_cents'),
  modelUsed: text('model_used')
});

export const approvals = pgTable('approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  subjectType: text('subject_type').notNull(),
  subjectId: text('subject_id').notNull(),
  level: text('level').notNull(),
  status: text('status').notNull().default('pending'),
  requestedBy: uuid('requested_by').notNull().references(() => users.id),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  notes: text('notes')
});

export const competitors = pgTable('competitors', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  handle: text('handle').notNull(),
  platform: platformEnum('platform').notNull(),
  tier: text('tier').notNull()
});

export const competitorSignals = pgTable('competitor_signals', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  competitorId: uuid('competitor_id').notNull().references(() => competitors.id),
  ts: timestamp('ts').notNull().defaultNow(),
  features: jsonb('features').notNull().default('{}'),
  metrics: jsonb('metrics').notNull().default('{}')
});

export const modelUsage = pgTable('model_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => orgs.id),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  tokensIn: integer('tokens_in').notNull(),
  tokensOut: integer('tokens_out').notNull(),
  costCents: integer('cost_cents').notNull(),
  ts: timestamp('ts').notNull().defaultNow()
});

// Relations
export const orgsRelations = relations(orgs, ({ many }) => ({
  users: many(users),
  mediaAssets: many(mediaAssets),
  scheduledPosts: many(scheduledPosts),
  mentions: many(mentions),
  missions: many(missions)
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  org: one(orgs, { fields: [users.orgId], references: [orgs.id] }),
  assignments: many(assignments),
  approvals: many(approvals)
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  org: one(orgs, { fields: [mediaAssets.orgId], references: [orgs.id] }),
  captionSuggestions: many(captionSuggestions),
  scheduledPosts: many(scheduledPosts)
}));

export const scheduledPostsRelations = relations(scheduledPosts, ({ one, many }) => ({
  org: one(orgs, { fields: [scheduledPosts.orgId], references: [orgs.id] }),
  asset: one(mediaAssets, { fields: [scheduledPosts.assetId], references: [mediaAssets.id] }),
  publishAttempts: many(publishAttempts),
  boostPlans: many(boostPlans),
  healthSnapshots: many(healthSnapshots)
}));
