/**
 * Enhanced Types for ViVi Learning Loop Engine - Sprint 36
 * 
 * This file contains all the type definitions needed for the enhanced
 * learning loop engine, performance optimization, and competitor benchmarking.
 */

// Learning Loop Request
export interface LearningLoopRequest {
  orgId: string;
  contentType: 'social_media' | 'advertising' | 'content_marketing' | 'email_marketing' | 'influencer_marketing';
  platforms: string[];
  learningGoals: string[];
  maxDuration: number; // days
  targetMetrics: string[];
  budget?: number;
  teamSize?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Learning Loop Result
export interface LearningLoopResult {
  success: boolean;
  loopId?: string;
  orgId?: string;
  contentType?: string;
  baselineMetrics?: PerformanceMetrics;
  learningObjectives?: string[];
  learningPhases?: LearningPhase[];
  optimizationStrategies?: any[];
  monitoringSetup?: any;
  status?: 'active' | 'paused' | 'completed' | 'failed';
  currentPhase?: number;
  totalPhases?: number;
  performanceMetrics?: PerformanceMetrics;
  recommendations?: any[];
  adjustments?: any[];
  startedAt?: Date;
  estimatedCompletion?: Date;
  processingTime?: number;
  error?: string;
  message?: string;
}

// Learning Phase
export interface LearningPhase {
  phaseNumber: number;
  objective: string;
  duration: number; // days
  metrics: string[];
  status: 'pending' | 'active' | 'completed' | 'failed';
  startDate: Date;
  endDate: Date;
  successCriteria: any;
  experiments: any[];
  results?: any;
  insights?: string[];
}

// Performance Metrics
export interface PerformanceMetrics {
  engagement: number;
  reach: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roi: number;
  costPerResult: number;
  growth: number;
  contentQuality: number;
  audienceRetention: number;
  brandSentiment: number;
  platformBreakdown: Record<string, {
    engagement: number;
    reach: number;
    impressions?: number;
    clicks?: number;
  }>;
  recordedAt: Date;
}

// Optimization Recommendation
export interface OptimizationRecommendation {
  id: string;
  description: string;
  expectedImpact: 'low' | 'medium' | 'high' | 'very_high';
  implementationEffort: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  riskAssessment: 'low' | 'medium' | 'high';
  priority: number;
  category: string;
  generatedAt: Date;
  metadata?: {
    confidence: number;
    dataPoints: number;
    historicalSuccess: number;
    similarCases: any[];
  };
}

// Learning Adjustment
export interface LearningAdjustment {
  id: string;
  recommendationId: string;
  type: string;
  parameters: any;
  expectedOutcome: {
    performanceChange: number;
    confidence: number;
    timeline: string;
    riskLevel: string;
  };
  confidence: number;
  appliedAt: Date;
  status: 'pending' | 'applied' | 'monitoring' | 'evaluated';
  actualOutcome?: {
    performanceChange: number;
    success: boolean;
    lessons: string[];
    nextSteps: string[];
  };
}

// Competitor Benchmark
export interface CompetitorBenchmark {
  orgId: string;
  platform: string;
  benchmarkDate: Date;
  competitors: Array<{
    handle: string;
    followerCount: number;
    engagementRate: number;
    performanceScore: number;
  }>;
  comparativeMetrics: {
    engagement: {
      own: number;
      competitors: number;
      difference: number;
      percentile: number;
    };
    reach: {
      own: number;
      competitors: number;
      difference: number;
      percentile: number;
    };
    growth: {
      own: number;
      competitors: number;
      difference: number;
      percentile: number;
    };
    contentQuality: {
      own: number;
      competitors: number;
      difference: number;
      percentile: number;
    };
  };
  insights: string[];
  improvementRoadmap: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
    recommendations: string[];
    timeline: string;
    successMetrics: any;
  };
  overallScore: number;
  recommendations: string[];
}

// Learning Loop Configuration
export interface LearningLoopConfig {
  orgId: string;
  contentType: string;
  learningRate: number;
  maxIterations: number;
  convergenceThreshold: number;
  performanceThresholds: {
    engagement: number;
    reach: number;
    conversions: number;
    roi: number;
  };
  optimizationRules: {
    maxAdjustmentsPerPhase: number;
    adjustmentCooldown: number; // hours
    rollbackThreshold: number;
    successThreshold: number;
  };
  monitoringConfig: {
    frequency: 'hourly' | 'daily' | 'weekly';
    alertThresholds: Record<string, number>;
    escalationRules: any[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Performance Analysis Result
export interface PerformanceAnalysisResult {
  loopId: string;
  phaseNumber: number;
  analysisDate: Date;
  metrics: PerformanceMetrics;
  trends: {
    engagement: 'increasing' | 'decreasing' | 'stable';
    reach: 'increasing' | 'decreasing' | 'stable';
    conversions: 'increasing' | 'decreasing' | 'stable';
    roi: 'increasing' | 'decreasing' | 'stable';
  };
  anomalies: Array<{
    metric: string;
    value: number;
    expected: number;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  insights: string[];
  recommendations: string[];
  nextActions: string[];
}

// Optimization Strategy
export interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  objective: string;
  approach: {
    methodology: string;
    testing: string;
    measurement: string;
    iteration: string;
  };
  successMetrics: {
    primary: string;
    secondary: string[];
    thresholds: Record<string, number>;
    timeline: string;
  };
  riskMitigation: {
    risks: string[];
    mitigations: string[];
    fallbackPlans: string[];
  };
  resources: {
    team: string[];
    tools: string[];
    budget: number;
    timeline: number;
  };
  status: 'planned' | 'active' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// Learning Loop Analytics
export interface LearningLoopAnalytics {
  loopId: string;
  orgId: string;
  summary: {
    totalPhases: number;
    completedPhases: number;
    activePhases: number;
    failedPhases: number;
    overallProgress: number;
    estimatedCompletion: Date;
  };
  performance: {
    baseline: PerformanceMetrics;
    current: PerformanceMetrics;
    improvement: {
      engagement: number;
      reach: number;
      conversions: number;
      roi: number;
      overall: number;
    };
    trends: Array<{
      date: Date;
      metrics: PerformanceMetrics;
      phase: number;
    }>;
  };
  insights: {
    topPerformers: string[];
    keyLearnings: string[];
    optimizationOpportunities: string[];
    riskFactors: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    priority: string[];
  };
  generatedAt: Date;
}

// Competitor Intelligence Data
export interface CompetitorIntelligenceData {
  competitorId: string;
  handle: string;
  platform: string;
  profile: {
    followerCount: number;
    followingCount: number;
    verified: boolean;
    category: string;
    bio: string;
    website?: string;
  };
  performance: {
    engagementRate: number;
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    growth: number;
    contentFrequency: number;
  };
  content: {
    totalPosts: number;
    averageLikes: number;
    averageComments: number;
    averageShares: number;
    topPerformingContent: Array<{
      url: string;
      engagement: number;
      reach: number;
      type: string;
    }>;
  };
  strategy: {
    postingSchedule: any;
    hashtagStrategy: string[];
    contentMix: Record<string, number>;
    audienceEngagement: any;
  };
  trends: {
    followerGrowth: number;
    engagementTrend: 'increasing' | 'decreasing' | 'stable';
    contentPerformance: 'improving' | 'declining' | 'stable';
    marketPosition: 'leader' | 'challenger' | 'niche' | 'emerging';
  };
  lastUpdated: Date;
}

// Benchmark Comparison Result
export interface BenchmarkComparisonResult {
  orgId: string;
  platform: string;
  comparisonDate: Date;
  ownMetrics: PerformanceMetrics;
  competitorMetrics: {
    average: PerformanceMetrics;
    top: PerformanceMetrics;
    bottom: PerformanceMetrics;
    distribution: Record<string, any>;
  };
  competitivePosition: {
    overall: number; // 0-100 score
    engagement: number;
    reach: number;
    growth: number;
    contentQuality: number;
    audienceSize: number;
  };
  gaps: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    strategic: string[];
  };
  actionPlan: {
    priorities: string[];
    timeline: string;
    resources: string[];
    successMetrics: any;
  };
}

// Learning Loop Status
export interface LearningLoopStatus {
  loopId: string;
  orgId: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  currentPhase: number;
  totalPhases: number;
  progress: number;
  lastActivity: Date;
  nextMilestone: Date;
  performance: {
    current: PerformanceMetrics;
    target: PerformanceMetrics;
    gap: Record<string, number>;
    trend: 'improving' | 'stable' | 'declining';
  };
  alerts: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    status: 'active' | 'acknowledged' | 'resolved';
  }>;
  nextActions: string[];
  estimatedCompletion: Date;
  updatedAt: Date;
}

// Performance Optimization Result
export interface PerformanceOptimizationResult {
  optimizationId: string;
  loopId: string;
  phaseNumber: number;
  strategy: string;
  parameters: any;
  beforeMetrics: PerformanceMetrics;
  afterMetrics: PerformanceMetrics;
  improvement: {
    engagement: number;
    reach: number;
    conversions: number;
    roi: number;
    overall: number;
  };
  confidence: number;
  success: boolean;
  lessons: string[];
  nextSteps: string[];
  appliedAt: Date;
  evaluatedAt: Date;
  status: 'applied' | 'monitoring' | 'evaluated' | 'rolled_back';
}

// Learning Loop Report
export interface LearningLoopReport {
  reportId: string;
  loopId: string;
  orgId: string;
  reportDate: Date;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  executive: {
    summary: string;
    keyMetrics: any;
    highlights: string[];
    challenges: string[];
    recommendations: string[];
  };
  detailed: {
    phaseProgress: any[];
    performanceAnalysis: PerformanceAnalysisResult;
    optimizationResults: PerformanceOptimizationResult[];
    competitorBenchmarks: CompetitorBenchmark[];
    insights: string[];
  };
  nextPeriod: {
    objectives: string[];
    priorities: string[];
    resourceRequirements: any;
    riskAssessment: any;
  };
  attachments: string[];
  generatedAt: Date;
}
