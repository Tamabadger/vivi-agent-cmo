/**
 * Enhanced Types for ViVi Voice Command System - Sprint 33
 * 
 * This file contains all the type definitions needed for the enhanced
 * voice command processing and campaign pipeline functionality.
 */

// Import Node.js Buffer type
import { Buffer } from 'buffer';

// Voice Command Status Enum
export enum VoiceCommandStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Voice Intent Types
export type VoiceIntent = 
  | 'schedule_post'
  | 'create_campaign'
  | 'analyze_performance'
  | 'manage_reviews'
  | 'boost_content'
  | 'check_analytics'
  | 'manage_competitors'
  | 'optimize_content'
  | 'unknown';

// Voice Entity Types
export interface VoiceEntity {
  type: 'platform' | 'date' | 'percentage' | 'content_type' | 'promotion' | 'hashtag' | 'audience' | 'time' | 'location';
  value: string;
  confidence: number;
  metadata?: Record<string, any>;
}

// Voice Command Request
export interface VoiceCommandRequest {
  audioBuffer: Buffer;
  orgId: string;
  userId?: string;
  context?: string;
  platform?: string;
  urgency?: 'low' | 'medium' | 'high';
  expectedIntent?: VoiceIntent;
}

// Voice Command Response
export interface VoiceCommandResponse {
  success: boolean;
  error?: string;
  message?: string;
  transcription?: string;
  intent?: VoiceIntent;
  entities?: VoiceEntity[];
  confidence?: number;
  campaignData?: CampaignPipelineData;
  voiceResponse?: {
    text: string;
    audioUrl?: string;
    actionSummary: string;
  };
  processingTime?: number;
  status?: VoiceCommandStatus;
  suggestions?: string[];
}

// Campaign Pipeline Data
export interface CampaignPipelineData {
  campaignName: string;
  description: string;
  platforms: string[];
  contentStrategy?: {
    type: 'promotional' | 'educational' | 'entertainment' | 'informational' | 'user_generated' | 'general';
    tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'creative' | 'excited';
    callToAction: string;
  };
  scheduling: {
    recommendedTimes: string[];
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    duration: string;
  };
  hashtags: string[];
  targetAudience: {
    demographics: string;
    interests: string[];
    location?: string;
    behavior?: string[];
  };
  orgId: string;
  generatedAt: Date;
  source: string;
}

// Scheduled Campaign
export interface ScheduledCampaign {
  id: string;
  orgId: string;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  platforms: string[];
  contentAssets: ContentAsset[];
  platformConfigs: PlatformConfig[];
  scheduling: SchedulingStrategy;
  hashtags: HashtagStrategy;
  targetAudience: {
    demographics: string;
    interests: string[];
    location?: string;
    behavior?: string[];
  };
  metrics: {
    estimatedReach: number;
    estimatedEngagement: number;
    estimatedConversions: number;
  };
  createdAt: Date;
  source: string;
  voiceMetadata?: {
    originalIntent: string;
    confidence: number;
    entities: VoiceEntity[];
  };
}

// Content Asset
export interface ContentAsset {
  type: 'image' | 'video' | 'audio' | 'text';
  description: string;
  dimensions?: { width: number; height: number };
  duration?: number; // for video/audio
  platform: string | 'all';
  aiGenerated: boolean;
  prompt?: string;
  url?: string;
  metadata?: Record<string, any>;
}

// Platform Configuration
export interface PlatformConfig {
  platform: string;
  contentAdaptation: any;
  postingSchedule: any;
  hashtagLimit: number;
  characterLimit: number;
  engagementOptimization: any;
}

// Scheduling Strategy
export interface SchedulingStrategy {
  type: string;
  duration: number;
  times: string[];
  timezone: string;
  autoOptimize: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

// Hashtag Strategy
export interface HashtagStrategy {
  primary: string[];
  secondary: string[];
  trending: string[];
  branded: string[];
  platformSpecific: Record<string, string[]>;
}

// Voice Processing Options
export interface EnhancedVoiceProcessingOptions {
  language: 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh';
  model: 'whisper-1';
  temperature: number;
  includeConfidence: boolean;
  includeSegments: boolean;
  includeSentiment: boolean;
  includeKeywords: boolean;
  intentExtraction: boolean;
  entityRecognition: boolean;
  campaignGeneration: boolean;
}

// Voice Command Analytics
export interface VoiceCommandAnalytics {
  totalCommands: number;
  successRate: number;
  avgProcessingTime: number;
  topIntents: Array<{ intent: string; count: number }>;
  platformUsage: Record<string, number>;
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
  errorRates: Record<string, number>;
}

// Campaign Performance Metrics
export interface CampaignPerformanceMetrics {
  campaignId: string;
  reach: number;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
  roi: number;
  costPerResult: number;
  platformBreakdown: Record<string, {
    reach: number;
    engagement: number;
    conversions: number;
  }>;
}

// Voice Command Validation Result
export interface VoiceCommandValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  requiredFields: string[];
  optionalFields: string[];
}

// Platform-Specific Voice Commands
export interface PlatformVoiceCommands {
  instagram: {
    postTypes: string[];
    storyCommands: string[];
    reelCommands: string[];
    hashtagSuggestions: string[];
  };
  tiktok: {
    videoTypes: string[];
    soundCommands: string[];
    trendCommands: string[];
    hashtagSuggestions: string[];
  };
  linkedin: {
    postTypes: string[];
    articleCommands: string[];
    companyCommands: string[];
    hashtagSuggestions: string[];
  };
  facebook: {
    postTypes: string[];
    groupCommands: string[];
    eventCommands: string[];
    hashtagSuggestions: string[];
  };
  youtube_shorts: {
    videoTypes: string[];
    thumbnailCommands: string[];
    seoCommands: string[];
    hashtagSuggestions: string[];
  };
}

// Voice Command Templates
export interface VoiceCommandTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  example: string;
  expectedIntent: VoiceIntent;
  requiredEntities: string[];
  optionalEntities: string[];
  platforms: string[];
  category: 'content' | 'analytics' | 'management' | 'optimization';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Voice Response Generation Options
export interface VoiceResponseOptions {
  includeAudio: boolean;
  audioFormat: 'mp3' | 'wav' | 'm4a';
  audioQuality: 'low' | 'medium' | 'high';
  includeText: boolean;
  includeSummary: boolean;
  language: string;
  tone: 'professional' | 'friendly' | 'casual' | 'excited';
}

// Campaign Pipeline Status
export interface CampaignPipelineStatus {
  campaignId: string;
  status: 'created' | 'validating' | 'generating_content' | 'optimizing' | 'scheduling' | 'ready' | 'failed';
  currentStep: string;
  totalSteps: number;
  progress: number;
  estimatedCompletion: Date;
  errors: string[];
  warnings: string[];
}

// Voice Command Context
export interface VoiceCommandContext {
  userProfile: {
    role: string;
    experience: 'beginner' | 'intermediate' | 'expert';
    preferences: Record<string, any>;
  };
  organization: {
    industry: string;
    size: string;
    targetAudience: string[];
    brandVoice: string;
  };
  recentCommands: VoiceCommandResponse[];
  activeCampaigns: ScheduledCampaign[];
  performanceHistory: CampaignPerformanceMetrics[];
}
