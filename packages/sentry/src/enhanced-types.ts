/**
 * Enhanced Types for ViVi Sentiment Scanner - Sprint 35
 * 
 * This file contains all the type definitions needed for the enhanced
 * sentiment scanning, emotion detection, and social listening capabilities.
 */

// Sentiment Categories
export type SentimentCategory = 
  | 'delight'
  | 'satisfaction'
  | 'neutral'
  | 'frustration'
  | 'anger'
  | 'urgency';

// Sentiment Scan Request
export interface SentimentScanRequest {
  contentId: string;
  content: string;
  platform: string;
  contentType: 'comment' | 'review' | 'mention' | 'post' | 'message';
  context?: string;
  language?: string;
  authorType?: 'customer' | 'influencer' | 'competitor' | 'general';
  location?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

// Sentiment Scan Result
export interface SentimentScanResult {
  success: boolean;
  contentId: string;
  platform: string;
  sentiment?: SentimentCategory;
  confidence?: number;
  emotions?: EmotionAnalysis;
  urgency?: UrgencyLevel;
  insights?: SentimentInsight;
  recommendations?: string[];
  keywords?: string[];
  processingTime?: number;
  scannedAt: Date;
  error?: string;
  message?: string;
  metadata?: {
    language: string;
    contentType: string;
    authorType: string;
    location: string;
  };
}

// Emotion Analysis
export interface EmotionAnalysis {
  primaryEmotion: string;
  emotions: Record<string, number>; // emotion: intensity (0-10)
  intensity: number; // 0-10 scale
  emotionalComplexity: 'simple' | 'moderate' | 'complex';
  detectedAt: Date;
}

// Urgency Level
export interface UrgencyLevel {
  level: number; // 1-10 scale
  reasoning: string;
  factors: string[];
  recommendedResponseTime: string;
  escalationRequired: boolean;
  assessedAt: Date;
}

// Sentiment Insight
export interface SentimentInsight {
  themes: string[];
  keywords: string[];
  brandMentions: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  customerNeeds: string[];
  opportunities: string[];
  threats: string[];
  insights: string[];
  extractedAt: Date;
}

// Trend Alert
export interface TrendAlert {
  id: string;
  orgId: string;
  platform: string;
  type: 'sentiment_shift' | 'urgency_spike' | 'emotion_trend' | 'keyword_surge' | 'crisis_indicator';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  recommendations: string[];
  detectedAt: Date;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
}

// Social Listening Configuration
export interface SocialListeningConfig {
  orgId: string;
  platforms: string[];
  keywords: string[];
  hashtags: string[];
  competitors: string[];
  influencers: string[];
  scanFrequency: number; // seconds
  alertThresholds: {
    negativeSentiment: number;
    urgencyLevel: number;
    mentionVolume: number;
    crisisKeywords: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Platform Monitoring Rules
export interface PlatformMonitoringRules {
  platform: string;
  contentTypes: string[];
  languageFilters: string[];
  geographicFilters: string[];
  userTypeFilters: string[];
  keywordRules: {
    include: string[];
    exclude: string[];
    required: string[];
  };
  sentimentThresholds: {
    positive: number;
    negative: number;
    neutral: number;
  };
  urgencyThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

// Sentiment Trend Analysis
export interface SentimentTrendAnalysis {
  orgId: string;
  platform: string;
  timeRange: 'hour' | 'day' | 'week' | 'month';
  trends: {
    sentiment: SentimentCategory;
    count: number;
    change: number; // percentage change
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
  insights: {
    topTrends: string[];
    anomalies: string[];
    recommendations: string[];
  };
  analyzedAt: Date;
}

// Crisis Detection Alert
export interface CrisisDetectionAlert {
  id: string;
  orgId: string;
  platform: string;
  type: 'sentiment_crisis' | 'viral_negative' | 'competitor_attack' | 'influencer_backlash';
  severity: 'medium' | 'high' | 'critical';
  description: string;
  indicators: {
    negativeSentiment: number;
    urgencyLevel: number;
    mentionVolume: number;
    viralPotential: number;
    brandImpact: number;
  };
  affectedContent: {
    contentId: string;
    platform: string;
    sentiment: SentimentCategory;
    urgency: number;
    reach: number;
  }[];
  recommendedActions: string[];
  escalationPath: string[];
  detectedAt: Date;
  status: 'active' | 'escalated' | 'resolved';
}

// Brand Mention Analysis
export interface BrandMentionAnalysis {
  orgId: string;
  platform: string;
  timeRange: string;
  mentions: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    urgent: number;
  };
  sentiment: {
    average: number;
    trend: 'improving' | 'stable' | 'declining';
    distribution: Record<SentimentCategory, number>;
  };
  engagement: {
    totalReach: number;
    totalEngagement: number;
    averageEngagement: number;
    topPerformers: Array<{
      contentId: string;
      sentiment: SentimentCategory;
      engagement: number;
      reach: number;
    }>;
  };
  keywords: Array<{
    keyword: string;
    frequency: number;
    sentiment: SentimentCategory;
    trend: 'rising' | 'stable' | 'falling';
  }>;
  analyzedAt: Date;
}

// Response Time Metrics
export interface ResponseTimeMetrics {
  orgId: string;
  platform: string;
  timeRange: string;
  metrics: {
    averageResponseTime: number; // hours
    medianResponseTime: number;
    p95ResponseTime: number;
    responseTimeDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
  };
  performance: {
    targetResponseTime: number;
    complianceRate: number;
    improvement: number;
    benchmark: number;
  };
  breakdown: {
    bySentiment: Record<SentimentCategory, number>;
    byUrgency: Record<string, number>;
    byPlatform: Record<string, number>;
    byContentType: Record<string, number>;
  };
  analyzedAt: Date;
}

// Sentiment Scanner Configuration
export interface SentimentScannerConfig {
  confidenceThreshold: number;
  scanFrequency: number;
  alertThresholds: {
    negativeSentiment: number;
    urgencyLevel: number;
    emotionIntensity: number;
    keywordFrequency: number;
  };
  aiModels: {
    sentiment: string;
    emotion: string;
    urgency: string;
    insight: string;
  };
  languageSupport: string[];
  contentFilters: {
    maxLength: number;
    minLength: number;
    excludedPatterns: string[];
    requiredPatterns: string[];
  };
  performance: {
    maxConcurrentScans: number;
    timeoutSeconds: number;
    retryAttempts: number;
  };
}

// Real-time Monitoring Event
export interface RealTimeMonitoringEvent {
  id: string;
  orgId: string;
  platform: string;
  eventType: 'sentiment_change' | 'urgency_spike' | 'crisis_detected' | 'trend_identified';
  content: {
    contentId: string;
    text: string;
    author: string;
    timestamp: Date;
    metadata: Record<string, any>;
  };
  analysis: {
    sentiment: SentimentCategory;
    confidence: number;
    emotions: EmotionAnalysis;
    urgency: UrgencyLevel;
    insights: SentimentInsight;
  };
  impact: {
    severity: string;
    reach: number;
    viralPotential: number;
    brandRisk: number;
  };
  recommendations: string[];
  timestamp: Date;
  status: 'new' | 'processing' | 'resolved';
}

// Historical Sentiment Data
export interface HistoricalSentimentData {
  orgId: string;
  platform: string;
  date: Date;
  metrics: {
    totalScans: number;
    sentimentDistribution: Record<SentimentCategory, number>;
    averageConfidence: number;
    topEmotions: Array<{ emotion: string; count: number }>;
    urgencyBreakdown: Array<{ level: number; count: number }>;
    responseTimeMetrics: {
      average: number;
      median: number;
      p95: number;
    };
  };
  trends: {
    sentimentChange: number;
    urgencyChange: number;
    volumeChange: number;
    engagementChange: number;
  };
  insights: {
    topThemes: string[];
    keyInsights: string[];
    recommendations: string[];
  };
  recordedAt: Date;
}
