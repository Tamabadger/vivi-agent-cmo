import OpenAI from 'openai';
import { LLMRouter } from '@vivi/router';
import { 
  LearningLoopRequest, 
  LearningLoopResult, 
  LearningPhase,
  PerformanceMetrics,
  OptimizationRecommendation,
  LearningAdjustment,
  CompetitorBenchmark
} from './enhanced-types';

/**
 * LearningLoopEngine - Adaptive learning and performance optimization for Sprint 36
 * 
 * This module provides intelligent learning loops that observe content performance,
 * automatically adjust strategies, and benchmark against competitors for continuous improvement.
 */
export class LearningLoopEngine {
  private openai: OpenAI;
  private llmRouter: LLMRouter;
  private learningRate: number;
  private maxIterations: number;

  constructor(
    openaiApiKey: string,
    llmRouter: LLMRouter,
    learningRate: number = 0.1,
    maxIterations: number = 10
  ) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.llmRouter = llmRouter;
    this.learningRate = learningRate;
    this.maxIterations = maxIterations;
  }

  /**
   * Initialize a new learning loop for content optimization
   * 
   * Creates an adaptive learning system that observes performance,
   * identifies patterns, and automatically adjusts strategies.
   */
  async initializeLearningLoop(
    request: LearningLoopRequest
  ): Promise<LearningLoopResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Analyze current performance baseline
      const baselineMetrics = await this.analyzeBaselinePerformance(request.orgId, request.contentType);
      
      // Step 2: Identify learning objectives
      const learningObjectives = await this.identifyLearningObjectives(request, baselineMetrics);
      
      // Step 3: Create learning phases
      const learningPhases = await this.createLearningPhases(learningObjectives, request.maxDuration);
      
      // Step 4: Initialize optimization strategies
      const optimizationStrategies = await this.initializeOptimizationStrategies(learningObjectives);
      
      // Step 5: Set up monitoring and feedback loops
      const monitoringSetup = await this.setupMonitoringAndFeedback(request.orgId, learningPhases);
      
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        loopId: this.generateLoopId(),
        orgId: request.orgId,
        contentType: request.contentType,
        baselineMetrics,
        learningObjectives,
        learningPhases,
        optimizationStrategies,
        monitoringSetup,
        status: 'active',
        currentPhase: 1,
        totalPhases: learningPhases.length,
        performanceMetrics: baselineMetrics,
        recommendations: [],
        adjustments: [],
        startedAt: new Date(),
        estimatedCompletion: this.calculateEstimatedCompletion(learningPhases),
        processingTime
      };

    } catch (error) {
      console.error('Learning loop initialization failed:', error);
      return {
        success: false,
        error: 'INITIALIZATION_FAILED',
        message: 'Failed to initialize learning loop. Please try again.',
        startedAt: new Date()
      };
    }
  }

  /**
   * Execute the next learning phase
   */
  async executeLearningPhase(
    loopId: string,
    phaseNumber: number,
    currentMetrics: PerformanceMetrics
  ): Promise<{
    phaseResult: any;
    nextRecommendations: string[];
    performanceChange: number;
    aiReasoning: string;
  }> {
    try {
      // Step 1: Analyze current phase performance
      const phaseAnalysis = await this.analyzePhasePerformance(loopId, phaseNumber, currentMetrics);
      
      // Step 2: Generate optimization recommendations
      const recommendations = await this.generateOptimizationRecommendations(phaseAnalysis, currentMetrics);
      
      // Step 3: Apply learning adjustments
      const adjustments = await this.applyLearningAdjustments(recommendations, currentMetrics);
      
      // Step 4: Calculate performance change
      const performanceChange = this.calculatePerformanceChange(currentMetrics, adjustments);
      
      // Step 5: Generate AI reasoning for changes
      const aiReasoning = await this.generateAIReasoning(phaseAnalysis, recommendations, adjustments);
      
      return {
        phaseResult: {
          phaseNumber,
          completed: true,
          recommendations,
          adjustments,
          performanceChange
        },
        nextRecommendations: recommendations.map(r => r.description),
        performanceChange,
        aiReasoning
      };

    } catch (error) {
      console.error('Learning phase execution failed:', error);
      throw new Error(`Failed to execute learning phase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Benchmark performance against competitors
   */
  async benchmarkAgainstCompetitors(
    orgId: string,
    platform: string,
    metrics: PerformanceMetrics
  ): Promise<CompetitorBenchmark> {
    try {
      // Step 1: Identify relevant competitors
      const competitors = await this.identifyRelevantCompetitors(orgId, platform);
      
      // Step 2: Gather competitor performance data
      const competitorData = await this.gatherCompetitorData(competitors, platform);
      
      // Step 3: Perform comparative analysis
      const comparativeAnalysis = await this.performComparativeAnalysis(metrics, competitorData);
      
      // Step 4: Generate competitive insights
      const competitiveInsights = await this.generateCompetitiveInsights(comparativeAnalysis);
      
      // Step 5: Create improvement roadmap
      const improvementRoadmap = await this.createImprovementRoadmap(competitiveInsights, metrics);
      
      return {
        orgId,
        platform,
        benchmarkDate: new Date(),
        competitors: competitors.map(c => ({
          handle: c.handle,
          followerCount: c.followerCount,
          engagementRate: c.engagementRate,
          performanceScore: c.performanceScore
        })),
        comparativeMetrics: {
          engagement: comparativeAnalysis.engagement,
          reach: comparativeAnalysis.reach,
          growth: comparativeAnalysis.growth,
          contentQuality: comparativeAnalysis.contentQuality
        },
        insights: competitiveInsights,
        improvementRoadmap,
        overallScore: this.calculateOverallCompetitiveScore(comparativeAnalysis),
        recommendations: improvementRoadmap.recommendations
      };

    } catch (error) {
      console.error('Competitor benchmarking failed:', error);
      throw new Error(`Failed to benchmark against competitors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze baseline performance
   */
  private async analyzeBaselinePerformance(orgId: string, contentType: string): Promise<PerformanceMetrics> {
    // This would query the database for actual performance data
    // For now, return mock baseline data
    return {
      engagement: 0.035,
      reach: 5000,
      impressions: 15000,
      clicks: 250,
      conversions: 15,
      roi: 2.4,
      costPerResult: 0.85,
      growth: 0.12,
      contentQuality: 0.78,
      audienceRetention: 0.65,
      brandSentiment: 0.82,
      platformBreakdown: {
        instagram: { engagement: 0.04, reach: 3000 },
        tiktok: { engagement: 0.03, reach: 2000 }
      },
      recordedAt: new Date()
    };
  }

  /**
   * Identify learning objectives
   */
  private async identifyLearningObjectives(
    request: LearningLoopRequest,
    baselineMetrics: PerformanceMetrics
  ): Promise<string[]> {
    const prompt = `Based on these performance metrics and learning goals, identify specific learning objectives:

Baseline Performance:
- Engagement Rate: ${(baselineMetrics.engagement * 100).toFixed(1)}%
- Reach: ${baselineMetrics.reach.toLocaleString()}
- ROI: ${baselineMetrics.roi}
- Content Quality: ${(baselineMetrics.contentQuality * 100).toFixed(1)}%

Learning Goals: ${request.learningGoals.join(', ')}

Content Type: ${request.contentType}
Platforms: ${request.platforms.join(', ')}

Identify 5-7 specific, measurable learning objectives that will improve performance.
Focus on actionable insights and testable hypotheses.

Respond with a JSON array of learning objectives.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in social media performance optimization and learning strategy development.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No response from GPT for learning objectives');
      }

      const objectives = JSON.parse(content);
      return objectives || [
        'Optimize posting times for maximum engagement',
        'Test different content formats and styles',
        'Improve hashtag strategy effectiveness',
        'Enhance audience targeting precision',
        'Optimize content length and structure'
      ];

    } catch (error) {
      console.error('Learning objectives identification failed:', error);
      return [
        'Optimize posting times for maximum engagement',
        'Test different content formats and styles',
        'Improve hashtag strategy effectiveness',
        'Enhance audience targeting precision',
        'Optimize content length and structure'
      ];
    }
  }

  /**
   * Create learning phases
   */
  private async createLearningPhases(
    objectives: string[],
    maxDuration: number
  ): Promise<LearningPhase[]> {
    const phases: LearningPhase[] = [];
    const phaseDuration = Math.ceil(maxDuration / objectives.length);

    for (let i = 0; i < objectives.length; i++) {
      const phase: LearningPhase = {
        phaseNumber: i + 1,
        objective: objectives[i],
        duration: phaseDuration,
        metrics: ['engagement', 'reach', 'conversions'],
        status: 'pending',
        startDate: new Date(Date.now() + (i * phaseDuration * 24 * 60 * 60 * 1000)),
        endDate: new Date(Date.now() + ((i + 1) * phaseDuration * 24 * 60 * 60 * 1000)),
        successCriteria: this.generateSuccessCriteria(objectives[i]),
        experiments: this.generateExperiments(objectives[i])
      };
      phases.push(phase);
    }

    return phases;
  }

  /**
   * Initialize optimization strategies
   */
  private async initializeOptimizationStrategies(objectives: string[]): Promise<any[]> {
    const strategies = [];

    for (const objective of objectives) {
      const strategy = await this.generateOptimizationStrategy(objective);
      strategies.push(strategy);
    }

    return strategies;
  }

  /**
   * Generate optimization strategy for an objective
   */
  private async generateOptimizationStrategy(objective: string): Promise<any> {
    const prompt = `Generate an optimization strategy for this learning objective:

Objective: ${objective}

Create a strategy that includes:
1. Key performance indicators (KPIs)
2. Testing approach and methodology
3. Success metrics and thresholds
4. Risk mitigation strategies
5. Resource requirements

Respond in JSON format with a comprehensive optimization strategy.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in social media optimization strategy and performance improvement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No response from GPT for optimization strategy');
      }

      return JSON.parse(content);

    } catch (error) {
      console.error('Optimization strategy generation failed:', error);
      return {
        kpis: ['engagement_rate', 'reach', 'conversions'],
        testingApproach: 'A/B testing with control groups',
        successMetrics: { engagement: 0.05, reach: 10000, conversions: 20 },
        riskMitigation: ['gradual rollout', 'performance monitoring', 'fallback plans'],
        resources: ['content_team', 'analytics_tools', 'testing_platform']
      };
    }
  }

  /**
   * Setup monitoring and feedback
   */
  private async setupMonitoringAndFeedback(orgId: string, phases: LearningPhase[]): Promise<any> {
    return {
      monitoringFrequency: 'daily',
      feedbackLoops: phases.map(phase => ({
        phase: phase.phaseNumber,
        metrics: phase.metrics,
        thresholds: this.generateThresholds(phase.objective),
        alerts: this.generateAlerts(phase.objective)
      })),
      reportingSchedule: 'weekly',
      escalationRules: this.generateEscalationRules()
    };
  }

  /**
   * Analyze phase performance
   */
  private async analyzePhasePerformance(
    loopId: string,
    phaseNumber: number,
    currentMetrics: PerformanceMetrics
  ): Promise<any> {
    // This would analyze actual performance data
    return {
      phaseNumber,
      performance: currentMetrics,
      trends: this.analyzeTrends(currentMetrics),
      anomalies: this.detectAnomalies(currentMetrics),
      insights: this.generateInsights(currentMetrics)
    };
  }

  /**
   * Generate optimization recommendations
   */
  private async generateOptimizationRecommendations(
    phaseAnalysis: any,
    currentMetrics: PerformanceMetrics
  ): Promise<OptimizationRecommendation[]> {
    const prompt = `Based on this phase performance analysis, generate optimization recommendations:

Phase Analysis: ${JSON.stringify(phaseAnalysis)}
Current Metrics: ${JSON.stringify(currentMetrics)}

Generate 3-5 specific, actionable recommendations that will improve performance.
Focus on:
1. Immediate optimizations
2. Medium-term improvements
3. Long-term strategic changes

Each recommendation should include:
- Description of the change
- Expected impact
- Implementation effort
- Risk assessment

Respond in JSON format with an array of recommendations.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in social media performance optimization and data-driven decision making.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No response from GPT for optimization recommendations');
      }

      const recommendations = JSON.parse(content);
      return recommendations.map((rec: any) => ({
        id: this.generateRecommendationId(),
        description: rec.description,
        expectedImpact: rec.expectedImpact,
        implementationEffort: rec.implementationEffort,
        riskAssessment: rec.riskAssessment,
        priority: this.calculatePriority(rec.expectedImpact, rec.implementationEffort),
        category: rec.category || 'general',
        generatedAt: new Date()
      }));

    } catch (error) {
      console.error('Optimization recommendations generation failed:', error);
      return [
        {
          id: this.generateRecommendationId(),
          description: 'Optimize posting times based on audience activity patterns',
          expectedImpact: 'high',
          implementationEffort: 'medium',
          riskAssessment: 'low',
          priority: 0.8,
          category: 'timing',
          generatedAt: new Date()
        }
      ];
    }
  }

  /**
   * Apply learning adjustments
   */
  private async applyLearningAdjustments(
    recommendations: OptimizationRecommendation[],
    currentMetrics: PerformanceMetrics
  ): Promise<LearningAdjustment[]> {
    const adjustments: LearningAdjustment[] = [];

    for (const recommendation of recommendations) {
      const adjustment = await this.createLearningAdjustment(recommendation, currentMetrics);
      adjustments.push(adjustment);
    }

    return adjustments;
  }

  /**
   * Create individual learning adjustment
   */
  private async createLearningAdjustment(
    recommendation: OptimizationRecommendation,
    currentMetrics: PerformanceMetrics
  ): Promise<LearningAdjustment> {
    return {
      id: this.generateAdjustmentId(),
      recommendationId: recommendation.id,
      type: this.determineAdjustmentType(recommendation),
      parameters: this.generateAdjustmentParameters(recommendation),
      expectedOutcome: this.predictOutcome(recommendation, currentMetrics),
      confidence: this.calculateConfidence(recommendation),
      appliedAt: new Date(),
      status: 'applied'
    };
  }

  /**
   * Calculate performance change
   */
  private calculatePerformanceChange(
    currentMetrics: PerformanceMetrics,
    adjustments: LearningAdjustment[]
  ): number {
    // Simple calculation - in production this would be more sophisticated
    let totalChange = 0;
    
    for (const adjustment of adjustments) {
      totalChange += adjustment.expectedOutcome.performanceChange || 0;
    }
    
    return totalChange / adjustments.length;
  }

  /**
   * Generate AI reasoning for changes
   */
  private async generateAIReasoning(
    phaseAnalysis: any,
    recommendations: OptimizationRecommendation[],
    adjustments: LearningAdjustment[]
  ): Promise<string> {
    const prompt = `Explain the reasoning behind these learning loop adjustments:

Phase Analysis: ${JSON.stringify(phaseAnalysis)}
Recommendations: ${JSON.stringify(recommendations)}
Adjustments: ${JSON.stringify(adjustments)}

Provide a clear, concise explanation of:
1. Why these changes were recommended
2. How they address the identified performance issues
3. Expected outcomes and timeline
4. Risk considerations and mitigation

Write in a professional, analytical tone suitable for business stakeholders.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in explaining data-driven optimization decisions and learning loop strategies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 400
      });

      const content = completion.choices[0].message.content;
      return content || 'AI reasoning generation failed';

    } catch (error) {
      console.error('AI reasoning generation failed:', error);
      return 'AI reasoning generation failed - manual review recommended';
    }
  }

  /**
   * Identify relevant competitors
   */
  private async identifyRelevantCompetitors(orgId: string, platform: string): Promise<any[]> {
    // This would query competitor intelligence data
    return [
      { handle: 'competitor1', followerCount: 50000, engagementRate: 0.04, performanceScore: 0.75 },
      { handle: 'competitor2', followerCount: 75000, engagementRate: 0.035, performanceScore: 0.72 },
      { handle: 'competitor3', followerCount: 60000, engagementRate: 0.045, performanceScore: 0.78 }
    ];
  }

  /**
   * Gather competitor data
   */
  private async gatherCompetitorData(competitors: any[], platform: string): Promise<any[]> {
    // This would gather actual competitor performance data
    return competitors.map(comp => ({
      ...comp,
      recentPerformance: {
        engagement: comp.engagementRate + (Math.random() - 0.5) * 0.01,
        reach: comp.followerCount * (0.1 + Math.random() * 0.2),
        growth: (Math.random() - 0.5) * 0.1
      }
    }));
  }

  /**
   * Perform comparative analysis
   */
  private async performComparativeAnalysis(
    metrics: PerformanceMetrics,
    competitorData: any[]
  ): Promise<any> {
    const avgCompetitorEngagement = competitorData.reduce((sum, comp) => sum + comp.recentPerformance.engagement, 0) / competitorData.length;
    const avgCompetitorGrowth = competitorData.reduce((sum, comp) => sum + comp.recentPerformance.growth, 0) / competitorData.length;

    return {
      engagement: {
        own: metrics.engagement,
        competitors: avgCompetitorEngagement,
        difference: metrics.engagement - avgCompetitorEngagement,
        percentile: this.calculatePercentile(metrics.engagement, competitorData.map(c => c.recentPerformance.engagement))
      },
      growth: {
        own: metrics.growth,
        competitors: avgCompetitorGrowth,
        difference: metrics.growth - avgCompetitorGrowth,
        percentile: this.calculatePercentile(metrics.growth, competitorData.map(c => c.recentPerformance.growth))
      },
      reach: {
        own: metrics.reach,
        competitors: competitorData.reduce((sum, comp) => sum + comp.recentPerformance.reach, 0) / competitorData.length,
        difference: 0, // Would calculate actual difference
        percentile: 0.5 // Would calculate actual percentile
      },
      contentQuality: {
        own: metrics.contentQuality,
        competitors: 0.75, // Mock average
        difference: metrics.contentQuality - 0.75,
        percentile: this.calculatePercentile(metrics.contentQuality, [0.7, 0.75, 0.8])
      }
    };
  }

  /**
   * Generate competitive insights
   */
  private async generateCompetitiveInsights(comparativeAnalysis: any): Promise<string[]> {
    const insights: string[] = [];

    if (comparativeAnalysis.engagement.difference > 0) {
      insights.push('Your engagement rate is above competitor average - maintain this advantage');
    } else {
      insights.push('Engagement rate below competitor average - focus on content quality and audience interaction');
    }

    if (comparativeAnalysis.growth.difference > 0) {
      insights.push('Growth rate exceeds competitors - leverage momentum for market expansion');
    } else {
      insights.push('Growth rate below competitors - review audience acquisition strategies');
    }

    if (comparativeAnalysis.contentQuality.difference > 0) {
      insights.push('Content quality superior to competitors - highlight this in marketing materials');
    } else {
      insights.push('Content quality below competitors - invest in creative resources and strategy');
    }

    return insights;
  }

  /**
   * Create improvement roadmap
   */
  private async createImprovementRoadmap(
    insights: string[],
    metrics: PerformanceMetrics
  ): Promise<any> {
    return {
      shortTerm: [
        'Optimize posting schedule based on competitor analysis',
        'Review and enhance content quality standards',
        'Implement A/B testing for engagement optimization'
      ],
      mediumTerm: [
        'Develop audience growth strategies',
        'Enhance content creation processes',
        'Build competitive intelligence monitoring'
      ],
      longTerm: [
        'Establish market leadership position',
        'Develop unique content differentiation',
        'Build sustainable competitive advantages'
      ],
      recommendations: insights,
      timeline: '3-6 months for measurable improvements',
      successMetrics: {
        engagement: metrics.engagement * 1.2,
        growth: metrics.growth * 1.15,
        contentQuality: Math.min(metrics.contentQuality * 1.1, 1.0)
      }
    };
  }

  /**
   * Calculate overall competitive score
   */
  private calculateOverallCompetitiveScore(comparativeAnalysis: any): number {
    const scores = [
      comparativeAnalysis.engagement.percentile,
      comparativeAnalysis.growth.percentile,
      comparativeAnalysis.contentQuality.percentile
    ];
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Helper methods
   */
  private generateSuccessCriteria(objective: string): any {
    // Generate success criteria based on objective
    return {
      engagement: 0.05,
      reach: 10000,
      conversions: 20
    };
  }

  private generateExperiments(objective: string): any[] {
    // Generate experiments based on objective
    return [
      {
        name: `Test ${objective}`,
        description: `Experiment to improve ${objective}`,
        duration: 7,
        metrics: ['engagement', 'reach']
      }
    ];
  }

  private generateThresholds(objective: string): any {
    return {
      warning: 0.8,
      critical: 0.6
    };
  }

  private generateAlerts(objective: string): any[] {
    return [
      {
        type: 'performance_drop',
        threshold: 0.8,
        action: 'investigate_cause'
      }
    ];
  }

  private generateEscalationRules(): any[] {
    return [
      {
        condition: 'performance_drop_30_percent',
        action: 'escalate_to_manager',
        timeframe: '24_hours'
      }
    ];
  }

  private analyzeTrends(metrics: PerformanceMetrics): any {
    return {
      engagement: 'stable',
      reach: 'increasing',
      conversions: 'stable'
    };
  }

  private detectAnomalies(metrics: PerformanceMetrics): any[] {
    return [];
  }

  private generateInsights(metrics: PerformanceMetrics): string[] {
    return [
      'Performance within expected ranges',
      'No significant anomalies detected'
    ];
  }

  private determineAdjustmentType(recommendation: OptimizationRecommendation): string {
    if (recommendation.description.includes('timing')) return 'schedule_optimization';
    if (recommendation.description.includes('content')) return 'content_optimization';
    if (recommendation.description.includes('audience')) return 'audience_optimization';
    return 'general_optimization';
  }

  private generateAdjustmentParameters(recommendation: OptimizationRecommendation): any {
    return {
      parameter: 'value',
      adjustment: 'amount'
    };
  }

  private predictOutcome(recommendation: OptimizationRecommendation, metrics: PerformanceMetrics): any {
    return {
      performanceChange: 0.1,
      confidence: 0.8
    };
  }

  private calculateConfidence(recommendation: OptimizationRecommendation): number {
    return 0.8;
  }

  private calculatePriority(expectedImpact: string, implementationEffort: string): number {
    const impactScores: Record<string, number> = { low: 0.3, medium: 0.6, high: 0.9 };
    const effortScores: Record<string, number> = { low: 0.9, medium: 0.6, high: 0.3 };
    
    return (impactScores[expectedImpact] || 0.5) * (effortScores[implementationEffort] || 0.5);
  }

  private calculatePercentile(value: number, values: number[]): number {
    const sorted = values.sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    return index === -1 ? 1.0 : index / sorted.length;
  }

  private calculateEstimatedCompletion(phases: LearningPhase[]): Date {
    const totalDays = phases.reduce((sum, phase) => sum + phase.duration, 0);
    return new Date(Date.now() + (totalDays * 24 * 60 * 60 * 1000));
  }

  private generateLoopId(): string {
    return `loop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecommendationId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAdjustmentId(): string {
    return `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
