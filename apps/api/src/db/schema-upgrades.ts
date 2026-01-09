import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, pgEnum, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Import existing tables from main schema
import { orgs, mediaAssets } from './schema';

// New enums for enhanced features
export const voiceCommandStatusEnum = pgEnum('voice_command_status', ['pending', 'processing', 'completed', 'failed']);
export const sentimentCategoryEnum = pgEnum('sentiment_category', ['delight', 'satisfaction', 'neutral', 'frustration', 'anger', 'urgency']);
export const mediaRemixTypeEnum = pgEnum('media_remix_type', ['auto_clip', 'faceless_video', 'visual_pack', 'trend_adaptation']);
export const learningLoopStatusEnum = pgEnum('learning_loop_status', ['active', 'paused', 'completed', 'failed']);

// Sprint 33: Voice-First Interaction Layer
export const voiceCommands = pgTable('voice_commands', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  userId: uuid('user_id'),
  audioUrl: text('audio_url').notNull(),
  transcription: text('transcription').notNull(),
  intent: text('intent').notNull(),
  confidence: decimal('confidence', { precision: 3, scale: 2 }).notNull(),
  entities: jsonb('entities').notNull().default('[]'),
  status: voiceCommandStatusEnum('status').notNull().default('pending'),
  campaignId: uuid('campaign_id'),
  processingTime: integer('processing_time'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at')
});

export const voiceCommandResponses = pgTable('voice_command_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  commandId: uuid('command_id').notNull().references(() => voiceCommands.id),
  responseType: text('response_type').notNull(), // 'text', 'audio', 'action'
  content: text('content').notNull(),
  audioUrl: text('audio_url'),
  actionTaken: jsonb('action_taken'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const voiceToCampaignPipelines = pgTable('voice_to_campaign_pipelines', {
  id: uuid('id').primaryKey().defaultRandom(),
  commandId: uuid('command_id').notNull().references(() => voiceCommands.id),
  campaignData: jsonb('campaign_data').notNull(),
  platform: text('platform').notNull(),
  scheduledFor: timestamp('scheduled_for'),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Sprint 34: AI Media Engine
export const mediaRemixes = pgTable('media_remixes', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  originalAssetId: uuid('original_asset_id').notNull(),
  remixType: mediaRemixTypeEnum('remix_type').notNull(),
  inputParams: jsonb('input_params').notNull(),
  outputAssets: jsonb('output_assets').notNull(),
  processingTime: integer('processing_time'),
  aiModel: text('ai_model'),
  cost: decimal('cost', { precision: 10, scale: 4 }),
  status: text('status').notNull().default('processing'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at')
});

export const autoClipperJobs = pgTable('auto_clipper_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  videoAssetId: uuid('video_asset_id').notNull(),
  targetDuration: integer('target_duration').notNull(), // seconds
  targetAspectRatio: text('target_aspect_ratio').notNull(),
  clipsGenerated: jsonb('clips_generated').notNull().default('[]'),
  aiAnalysis: jsonb('ai_analysis'),
  processingTime: integer('processing_time'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at')
});

export const facelessVideoTemplates = pgTable('faceless_video_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  templateData: jsonb('template_data').notNull(),
  aiPrompts: jsonb('ai_prompts').notNull(),
  outputFormat: text('output_format').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const visualPacks = pgTable('visual_packs', {
  id: uuid('id').primaryKey().defaultRandom(),
  packName: text('pack_name').notNull(),
  packType: text('pack_type').notNull(), // 'faceless_video', 'visual_elements', 'trend_adaptation'
  description: text('description'),
  assets: jsonb('assets').notNull(),
  aiPrompts: jsonb('ai_prompts'),
  pricing: jsonb('pricing'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Sprint 35: Social Listening + Sentiment Intelligence
export const sentimentScans = pgTable('sentiment_scans', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  platform: text('platform').notNull(),
  contentId: text('content_id').notNull(),
  contentType: text('content_type').notNull(), // 'comment', 'review', 'mention'
  rawContent: text('raw_content').notNull(),
  sentiment: sentimentCategoryEnum('sentiment').notNull(),
  confidence: decimal('confidence', { precision: 3, scale: 2 }).notNull(),
  emotions: jsonb('emotions'),
  keywords: text('keywords').array(),
  urgency: integer('urgency'), // 1-10 scale
  aiAnalysis: jsonb('ai_analysis'),
  processedAt: timestamp('processed_at').notNull().defaultNow()
});

export const trendListeners = pgTable('trend_listeners', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  platform: text('platform').notNull(),
  keywords: text('keywords').array().notNull(),
  hashtags: text('hashtags').array().notNull(),
  isActive: boolean('is_active').notNull().default(true),
  lastScanAt: timestamp('last_scan_at'),
  scanFrequency: integer('scan_frequency').notNull().default(3600), // seconds
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const trendInsights = pgTable('trend_insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  listenerId: uuid('listener_id').notNull().references(() => trendListeners.id),
  trendData: jsonb('trend_data').notNull(),
  sentiment: sentimentCategoryEnum('sentiment'),
  engagement: integer('engagement'),
  growth: decimal('growth', { precision: 5, scale: 2 }),
  relevance: decimal('relevance', { precision: 3, scale: 2 }),
  detectedAt: timestamp('detected_at').notNull().defaultNow()
});

// Sprint 36: Adaptive Learning Loop + Competitor Benchmarking
export const learningLoops = pgTable('learning_loops', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  loopType: text('loop_type').notNull(), // 'content_performance', 'audience_behavior', 'campaign_optimization'
  status: learningLoopStatusEnum('status').notNull().default('active'),
  currentPhase: text('current_phase').notNull(),
  totalPhases: integer('total_phases').notNull(),
  performanceMetrics: jsonb('performance_metrics').notNull(),
  recommendations: jsonb('recommendations').notNull(),
  adjustments: jsonb('adjustments').notNull(),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  lastTickAt: timestamp('last_tick_at'),
  completedAt: timestamp('completed_at')
});

export const learningLoopTicks = pgTable('learning_loop_ticks', {
  id: uuid('id').primaryKey().defaultRandom(),
  loopId: uuid('loop_id').notNull().references(() => learningLoops.id),
  phase: text('phase').notNull(),
  action: text('action').notNull(),
  result: jsonb('result').notNull(),
  performanceChange: decimal('performance_change', { precision: 5, scale: 2 }),
  aiReasoning: text('ai_reasoning'),
  tickedAt: timestamp('ticked_at').notNull().defaultNow()
});

export const competitorSnapshots = pgTable('competitor_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  competitorHandle: text('competitor_handle').notNull(),
  platform: text('platform').notNull(),
  followerCount: integer('follower_count'),
  engagementRate: decimal('engagement_rate', { precision: 5, scale: 4 }),
  topHashtags: text('top_hashtags').array(),
  topSounds: text('top_sounds').array(),
  contentFrequency: integer('content_frequency'), // posts per week
  bestPerformingContent: jsonb('best_performing_content'),
  aiInsights: jsonb('ai_insights'),
  snapshotAt: timestamp('snapshot_at').notNull().defaultNow()
});

export const competitorScorecards = pgTable('competitor_scorecards', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  competitorId: uuid('competitor_id').notNull().references(() => competitorSnapshots.id),
  overallScore: decimal('overall_score', { precision: 3, scale: 2 }),
  categoryScores: jsonb('category_scores').notNull(), // engagement, growth, content_quality, etc.
  recommendations: jsonb('recommendations').notNull(),
  opportunities: jsonb('opportunities').notNull(),
  threats: jsonb('threats').notNull(),
  generatedAt: timestamp('generated_at').notNull().defaultNow()
});

// Revenue and monetization tables
export const agentStorePacks = pgTable('agent_store_packs', {
  id: uuid('id').primaryKey().defaultRandom(),
  packName: text('pack_name').notNull(),
  packType: text('pack_type').notNull(), // 'voice', 'visual', 'sentiment', 'competitor'
  description: text('description'),
  features: jsonb('features').notNull(),
  pricing: jsonb('pricing').notNull(),
  targetTier: text('target_tier'), // LITE, PLUS, PRO, PRIME
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const packSubscriptions = pgTable('pack_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  packId: uuid('pack_id').notNull().references(() => agentStorePacks.id),
  status: text('status').notNull().default('active'),
  startDate: timestamp('start_date').notNull().defaultNow(),
  endDate: timestamp('end_date'),
  autoRenew: boolean('auto_renew').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Enhanced analytics for new features
export const enhancedAnalytics = pgTable('enhanced_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  feature: text('feature').notNull(), // 'voice_commands', 'media_remixes', 'sentiment_scans', 'learning_loops'
  metric: text('metric').notNull(),
  value: decimal('value', { precision: 10, scale: 4 }).notNull(),
  dimension: text('dimension'), // time, user, content_type, etc.
  dimensionValue: text('dimension_value'),
  recordedAt: timestamp('recorded_at').notNull().defaultNow()
});

// Relations
export const voiceCommandsRelations = relations(voiceCommands, ({ one, many }) => ({
  responses: many(voiceCommandResponses),
  campaignPipeline: many(voiceToCampaignPipelines)
}));

export const voiceCommandResponsesRelations = relations(voiceCommandResponses, ({ one }) => ({
  command: one(voiceCommands, { fields: [voiceCommandResponses.commandId], references: [voiceCommands.id] })
}));

export const voiceToCampaignPipelinesRelations = relations(voiceToCampaignPipelines, ({ one }) => ({
  command: one(voiceCommands, { fields: [voiceToCampaignPipelines.commandId], references: [voiceCommands.id] })
}));

export const mediaRemixesRelations = relations(mediaRemixes, ({ one }) => ({
  originalAsset: one(mediaAssets, { fields: [mediaRemixes.originalAssetId], references: [mediaAssets.id] })
}));

export const autoClipperJobsRelations = relations(autoClipperJobs, ({ one }) => ({
  videoAsset: one(mediaAssets, { fields: [autoClipperJobs.videoAssetId], references: [mediaAssets.id] })
}));

export const sentimentScansRelations = relations(sentimentScans, ({ one }) => ({
  org: one(orgs, { fields: [sentimentScans.orgId], references: [orgs.id] })
}));

export const trendListenersRelations = relations(trendListeners, ({ one, many }) => ({
  org: one(orgs, { fields: [trendListeners.orgId], references: [orgs.id] }),
  insights: many(trendInsights)
}));

export const trendInsightsRelations = relations(trendInsights, ({ one }) => ({
  listener: one(trendListeners, { fields: [trendInsights.listenerId], references: [trendListeners.id] })
}));

export const learningLoopsRelations = relations(learningLoops, ({ one, many }) => ({
  org: one(orgs, { fields: [learningLoops.orgId], references: [orgs.id] }),
  ticks: many(learningLoopTicks)
}));

export const learningLoopTicksRelations = relations(learningLoopTicks, ({ one }) => ({
  loop: one(learningLoops, { fields: [learningLoopTicks.loopId], references: [learningLoops.id] })
}));

export const competitorSnapshotsRelations = relations(competitorSnapshots, ({ one, many }) => ({
  org: one(orgs, { fields: [competitorSnapshots.orgId], references: [orgs.id] }),
  scorecards: many(competitorScorecards)
}));

export const competitorScorecardsRelations = relations(competitorScorecards, ({ one }) => ({
  competitor: one(competitorSnapshots, { fields: [competitorScorecards.competitorId], references: [competitorSnapshots.id] })
}));

export const packSubscriptionsRelations = relations(packSubscriptions, ({ one }) => ({
  org: one(orgs, { fields: [packSubscriptions.orgId], references: [orgs.id] }),
  pack: one(agentStorePacks, { fields: [packSubscriptions.packId], references: [agentStorePacks.id] })
}));
