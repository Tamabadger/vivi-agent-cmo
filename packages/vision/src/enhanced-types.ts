/**
 * Enhanced Types for ViVi Vision Remix Engine - Sprint 34
 * 
 * This file contains all the type definitions needed for the enhanced
 * vision remix engine, auto-clipping, and faceless video generation.
 */

// Remix Types
export type RemixType = 
  | 'story_format'
  | 'reel_format'
  | 'vertical_video'
  | 'trend_adaptation'
  | 'professional_format'
  | 'short_format'
  | 'auto_clip'
  | 'faceless_video'
  | 'visual_pack'
  | 'trend_adaptation';

// Vision Remix Request
export interface VisionRemixRequest {
  contentUrl: string;
  contentType: 'image' | 'video' | 'audio' | 'mixed';
  platforms: string[];
  priority: 'effort' | 'impact' | 'balanced';
  targetDuration?: number;
  targetAspectRatio?: string;
  includeAudio?: boolean;
  style?: string;
  brandGuidelines?: {
    colors: string[];
    fonts: string[];
    logo: string;
    tone: string;
  };
}

// Vision Remix Response
export interface VisionRemixResponse {
  success: boolean;
  recommendations: RemixRecommendation[];
  estimatedProcessingTime: number;
  totalCost: number;
  error?: string;
}

// Remix Recommendation
export interface RemixRecommendation {
  id: string;
  originalContentId: string;
  remixType: RemixType;
  targetPlatform: string;
  description: string;
  estimatedEffort: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  expectedImpact: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  priority: number;
  aiGenerated: boolean;
  createdAt: Date;
  metadata?: {
    suggestedHashtags: string[];
    optimalPostingTime: string;
    targetAudience: string[];
    engagementPredictions: {
      reach: number;
      engagement: number;
      conversions: number;
    };
  };
}

// Content Remix
export interface ContentRemix {
  id: string;
  orgId: string;
  originalContentId: string | null;
  remixType: RemixType;
  targetPlatform: string;
  contentUrl: string;
  metadata: {
    dimensions: { width: number; height: number };
    duration?: number;
    fileSize: number;
    format: string;
    aspectRatio?: string;
    fps?: number;
    bitrate?: number;
  };
  aiGenerationParams: AIGenerationParams;
  performance: {
    estimatedReach: number;
    estimatedEngagement: number;
    estimatedCost: number;
  };
  status: 'processing' | 'generated' | 'failed' | 'optimized';
  createdAt: Date;
  completedAt?: Date;
  tags?: string[];
  categories?: string[];
}

// AI Generation Parameters
export interface AIGenerationParams {
  model: string;
  style: string;
  quality: 'standard' | 'high' | 'ultra';
  size: string;
  prompt: string;
  maxTokens: number;
  temperature?: number;
  seed?: number;
  negativePrompt?: string;
  guidanceScale?: number;
  numInferenceSteps?: number;
}

// Auto Clipper Job
export interface AutoClipperJob {
  id: string;
  orgId: string;
  videoUrl: string;
  targetPlatform: string;
  targetDuration: number;
  targetAspectRatio: string;
  clipsGenerated: ContentRemix[];
  processingStatus: 'pending' | 'analyzing' | 'clipping' | 'optimizing' | 'completed' | 'failed';
  progress: number;
  estimatedCompletion: Date;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  metadata?: {
    originalDuration: number;
    totalClips: number;
    averageClipDuration: number;
    qualityScore: number;
  };
}

// Faceless Video Template
export interface FacelessVideoTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'lifestyle' | 'educational' | 'entertainment' | 'promotional';
  style: 'modern' | 'minimalist' | 'vibrant' | 'professional' | 'creative';
  duration: number;
  aspectRatio: string;
  elements: {
    backgrounds: string[];
    animations: string[];
    transitions: string[];
    overlays: string[];
  };
  aiPrompts: {
    sceneGeneration: string;
    styleApplication: string;
    animationSelection: string;
  };
  isActive: boolean;
  usageCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

// Visual Pack
export interface VisualPack {
  id: string;
  name: string;
  description: string;
  category: 'templates' | 'elements' | 'styles' | 'animations' | 'transitions';
  type: 'free' | 'premium' | 'enterprise';
  price: number;
  currency: string;
  assets: {
    templates: FacelessVideoTemplate[];
    elements: string[];
    styles: string[];
    fonts: string[];
    colors: string[];
  };
  compatibility: {
    platforms: string[];
    formats: string[];
    aspectRatios: string[];
  };
  usage: {
    downloads: number;
    activeUsers: number;
    rating: number;
    reviews: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Content Analysis Result
export interface ContentAnalysisResult {
  contentId: string;
  contentType: string;
  keyElements: {
    visual: string[];
    audio: string[];
    text: string[];
    branding: string[];
  };
  engagementPotential: 'low' | 'medium' | 'high' | 'very_high';
  remixOpportunities: {
    platform: string;
    format: string;
    description: string;
    effort: string;
    impact: string;
  }[];
  performanceIndicators: {
    visualAppeal: number;
    brandAlignment: number;
    platformOptimization: number;
    trendRelevance: number;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  metadata: {
    duration: number;
    dimensions: { width: number; height: number };
    fileSize: number;
    format: string;
    tags: string[];
    categories: string[];
  };
}

// Platform Optimization Rules
export interface PlatformOptimizationRules {
  platform: string;
  contentFormats: {
    images: {
      aspectRatios: string[];
      maxDimensions: { width: number; height: number };
      fileFormats: string[];
      maxFileSize: number;
    };
    videos: {
      aspectRatios: string[];
      maxDuration: number;
      maxDimensions: { width: number; height: number };
      fileFormats: string[];
      maxFileSize: number;
      fps: number[];
      bitrate: number[];
    };
  };
  engagementOptimization: {
    bestPostingTimes: string[];
    optimalFrequency: string;
    hashtagStrategy: {
      maxHashtags: number;
      recommendedCategories: string[];
      trendingApproach: string;
    };
    contentStrategy: {
      preferredTypes: string[];
      tone: string;
      callToAction: string;
    };
  };
  technicalRequirements: {
    compression: boolean;
    watermarking: boolean;
    metadata: boolean;
    accessibility: boolean;
  };
}

// Remix Performance Metrics
export interface RemixPerformanceMetrics {
  remixId: string;
  originalContentId: string;
  platform: string;
  metrics: {
    reach: number;
    impressions: number;
    engagement: number;
    clicks: number;
    conversions: number;
    shares: number;
    saves: number;
  };
  performance: {
    engagementRate: number;
    clickThroughRate: number;
    conversionRate: number;
    costPerResult: number;
    roi: number;
  };
  comparison: {
    originalPerformance: number;
    improvement: number;
    percentile: number;
  };
  insights: {
    topPerformingElements: string[];
    audienceResponse: string[];
    optimizationOpportunities: string[];
  };
  recordedAt: Date;
}

// AI Model Configuration
export interface AIModelConfiguration {
  model: string;
  version: string;
  capabilities: {
    imageGeneration: boolean;
    videoGeneration: boolean;
    contentAnalysis: boolean;
    styleTransfer: boolean;
    upscaling: boolean;
  };
  performance: {
    speed: 'slow' | 'medium' | 'fast';
    quality: 'low' | 'medium' | 'high' | 'ultra';
    cost: number;
    tokenLimit: number;
  };
  supportedFormats: {
    input: string[];
    output: string[];
  };
  isActive: boolean;
  lastUpdated: Date;
}

// Content Generation Pipeline
export interface ContentGenerationPipeline {
  id: string;
  orgId: string;
  type: 'remix' | 'generation' | 'optimization';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  steps: {
    step: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    startTime?: Date;
    endTime?: Date;
    error?: string;
  }[];
  input: {
    contentUrl?: string;
    prompt?: string;
    parameters: Record<string, any>;
  };
  output: {
    contentUrl?: string;
    metadata?: Record<string, any>;
    performance?: Record<string, any>;
  };
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration: number;
  actualDuration?: number;
  cost: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// Trend Analysis Result
export interface TrendAnalysisResult {
  platform: string;
  category: string;
  trends: {
    hashtag: string;
    volume: number;
    growth: number;
    relevance: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    topContent: {
      url: string;
      engagement: number;
      style: string;
      elements: string[];
    }[];
  }[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  analysisDate: Date;
  nextUpdate: Date;
}

// Brand Guidelines
export interface BrandGuidelines {
  orgId: string;
  colors: {
    primary: string[];
    secondary: string[];
    accent: string[];
    neutral: string[];
  };
  typography: {
    primaryFont: string;
    secondaryFont: string;
    headingFont: string;
    bodyFont: string;
  };
  imagery: {
    style: string;
    mood: string;
    composition: string;
    filters: string[];
  };
  voice: {
    tone: string;
    personality: string;
    language: string;
    examples: string[];
  };
  restrictions: {
    forbiddenElements: string[];
    requiredElements: string[];
    usageGuidelines: string[];
  };
  lastUpdated: Date;
}

// Content Quality Score
export interface ContentQualityScore {
  contentId: string;
  overallScore: number;
  dimensions: {
    visualAppeal: number;
    brandAlignment: number;
    platformOptimization: number;
    engagementPotential: number;
    accessibility: number;
    technicalQuality: number;
  };
  factors: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  benchmark: {
    industry: number;
    platform: number;
    historical: number;
  };
  calculatedAt: Date;
}
