import OpenAI from 'openai';
import { LLMRouter } from '@vivi/router';
import { 
  SentimentScanRequest, 
  SentimentScanResult, 
  SentimentCategory,
  EmotionAnalysis,
  UrgencyLevel,
  SentimentInsight,
  TrendAlert
} from './enhanced-types';

/**
 * ViViSentimentScanner - Real-time sentiment analysis and emotion detection for Sprint 35
 * 
 * This module provides comprehensive sentiment scanning, emotion analysis,
 * and urgency detection for social media monitoring and brand protection.
 */
export class ViViSentimentScanner {
  private openai: OpenAI;
  private llmRouter: LLMRouter;
  private confidenceThreshold: number;
  private scanFrequency: number;

  constructor(
    openaiApiKey: string,
    llmRouter: LLMRouter,
    confidenceThreshold: number = 0.7,
    scanFrequency: number = 300 // 5 minutes default
  ) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.llmRouter = llmRouter;
    this.confidenceThreshold = confidenceThreshold;
    this.scanFrequency = scanFrequency;
  }

  /**
   * Scan content for sentiment analysis
   * 
   * Analyzes text content for sentiment, emotions, urgency, and key insights
   * to provide real-time brand monitoring and customer feedback analysis.
   */
  async scanContent(
    request: SentimentScanRequest
  ): Promise<SentimentScanResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Perform sentiment analysis
      const sentimentAnalysis = await this.analyzeSentiment(request.content, request.context);
      
      // Step 2: Detect emotions and intensity
      const emotionAnalysis = await this.detectEmotions(request.content, sentimentAnalysis.sentiment);
      
      // Step 3: Assess urgency level
      const urgencyLevel = await this.assessUrgency(request.content, sentimentAnalysis, emotionAnalysis);
      
      // Step 4: Extract key insights and keywords
      const insights = await this.extractInsights(request.content, sentimentAnalysis, emotionAnalysis);
      
      // Step 5: Generate actionable recommendations
      const recommendations = await this.generateRecommendations(sentimentAnalysis, emotionAnalysis, urgencyLevel);
      
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        contentId: request.contentId,
        platform: request.platform,
        sentiment: sentimentAnalysis.sentiment,
        confidence: sentimentAnalysis.confidence,
        emotions: emotionAnalysis,
        urgency: urgencyLevel,
        insights,
        recommendations,
        keywords: insights.keywords,
        processingTime,
        scannedAt: new Date(),
        metadata: {
          language: request.language || 'en',
          contentType: request.contentType || 'post',
          authorType: request.authorType || 'general',
          location: request.location || 'unknown'
        }
      };

    } catch (error) {
      console.error('Sentiment scanning failed:', error);
      return {
        success: false,
        contentId: request.contentId,
        platform: request.platform,
        error: 'SCANNING_FAILED',
        message: 'Failed to analyze sentiment. Please try again.',
        scannedAt: new Date()
      };
    }
  }

  /**
   * Perform real-time sentiment analysis
   */
  private async analyzeSentiment(content: string, context?: string): Promise<{
    sentiment: SentimentCategory;
    confidence: number;
    reasoning: string;
  }> {
    const prompt = `Analyze the sentiment of this content and classify it into one of these categories:

SENTIMENT CATEGORIES:
- delight: Extremely positive, enthusiastic, thrilled
- satisfaction: Positive, happy, content
- neutral: Neither positive nor negative, factual
- frustration: Slightly negative, annoyed, disappointed
- anger: Very negative, angry, upset
- urgency: Requires immediate attention, time-sensitive

Content: "${content}"
Context: ${context || 'General social media content'}

Consider:
1. Overall emotional tone
2. Language intensity
3. Context and intent
4. Cultural nuances
5. Brand implications

Respond in JSON:
{
  "sentiment": "sentiment_category",
  "confidence": 0.95,
  "reasoning": "Detailed explanation of classification"
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert sentiment analyst specializing in social media content analysis and brand monitoring.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 400
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No response from GPT for sentiment analysis');
      }

      const analysis = JSON.parse(content);
      
      return {
        sentiment: analysis.sentiment || 'neutral',
        confidence: analysis.confidence || 0.5,
        reasoning: analysis.reasoning || 'Analysis completed'
      };

    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        reasoning: 'Analysis failed, defaulting to neutral'
      };
    }
  }

  /**
   * Detect emotions and their intensity
   */
  private async detectEmotions(content: string, sentiment: SentimentCategory): Promise<EmotionAnalysis> {
    const prompt = `Analyze this content for specific emotions and their intensity levels (0-10):

Content: "${content}"
Overall Sentiment: ${sentiment}

Detect and rate these emotions:
- Joy/Happiness
- Sadness
- Anger
- Fear
- Surprise
- Disgust
- Trust
- Anticipation
- Contempt
- Love

Consider:
1. Explicit emotional language
2. Implicit emotional cues
3. Context and tone
4. Intensity indicators

Respond in JSON:
{
  "primaryEmotion": "emotion_name",
  "emotions": {
    "joy": 8,
    "sadness": 2,
    "anger": 1,
    "fear": 0,
    "surprise": 3,
    "disgust": 0,
    "trust": 6,
    "anticipation": 7,
    "contempt": 0,
    "love": 5
  },
  "intensity": 7,
  "emotionalComplexity": "simple|moderate|complex"
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in emotion detection and psychological analysis of social media content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No response from GPT for emotion detection');
      }

      const emotions = JSON.parse(content);
      
      return {
        primaryEmotion: emotions.primaryEmotion || 'neutral',
        emotions: emotions.emotions || {},
        intensity: emotions.intensity || 5,
        emotionalComplexity: emotions.emotionalComplexity || 'moderate',
        detectedAt: new Date()
      };

    } catch (error) {
      console.error('Emotion detection failed:', error);
      return {
        primaryEmotion: 'neutral',
        emotions: {},
        intensity: 5,
        emotionalComplexity: 'moderate',
        detectedAt: new Date()
      };
    }
  }

  /**
   * Assess urgency level of content
   */
  private async assessUrgency(
    content: string,
    sentiment: any,
    emotions: EmotionAnalysis
  ): Promise<UrgencyLevel> {
    const prompt = `Assess the urgency level of this content (1-10 scale):

Content: "${content}"
Sentiment: ${sentiment.sentiment}
Primary Emotion: ${emotions.primaryEmotion}
Emotional Intensity: ${emotions.intensity}/10

URGENCY FACTORS:
- Time sensitivity (deadlines, immediate needs)
- Emotional intensity (anger, fear, excitement)
- Action required (responses, interventions)
- Impact potential (brand damage, customer satisfaction)
- Escalation risk (viral potential, crisis)

URGENCY LEVELS:
1-2: Very Low - No immediate action needed
3-4: Low - Monitor, plan response
5-6: Medium - Respond within hours
7-8: High - Respond within 1-2 hours
9-10: Critical - Immediate response required

Respond in JSON:
{
  "level": 7,
  "reasoning": "Detailed explanation of urgency assessment",
  "factors": ["time_sensitive", "high_impact", "escalation_risk"],
  "recommendedResponseTime": "1-2 hours",
  "escalationRequired": true
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in crisis management and urgency assessment for brand monitoring.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 400
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No response from GPT for urgency assessment');
      }

      const urgency = JSON.parse(content);
      
      return {
        level: urgency.level || 5,
        reasoning: urgency.reasoning || 'Standard urgency assessment',
        factors: urgency.factors || [],
        recommendedResponseTime: urgency.recommendedResponseTime || '24 hours',
        escalationRequired: urgency.escalationRequired || false,
        assessedAt: new Date()
      };

    } catch (error) {
      console.error('Urgency assessment failed:', error);
      return {
        level: 5,
        reasoning: 'Assessment failed, defaulting to medium urgency',
        factors: [],
        recommendedResponseTime: '24 hours',
        escalationRequired: false,
        assessedAt: new Date()
      };
    }
  }

  /**
   * Extract key insights and keywords
   */
  private async extractInsights(
    content: string,
    sentiment: any,
    emotions: EmotionAnalysis
  ): Promise<SentimentInsight> {
    const prompt = `Extract key insights from this content:

Content: "${content}"
Sentiment: ${sentiment.sentiment}
Primary Emotion: ${emotions.primaryEmotion}

Extract:
1. Key themes and topics
2. Important keywords and phrases
3. Brand mentions and sentiment
4. Customer needs and pain points
5. Opportunities and threats
6. Actionable insights

Respond in JSON:
{
  "themes": ["customer_service", "product_quality", "brand_experience"],
  "keywords": ["amazing", "service", "quality", "recommend"],
  "brandMentions": {
    "positive": ["excellent", "love", "amazing"],
    "negative": [],
    "neutral": ["brand", "company"]
  },
  "customerNeeds": ["better_support", "faster_delivery"],
  "opportunities": ["highlight_service_quality", "share_customer_stories"],
  "threats": ["competitor_mentions", "negative_word_of_mouth"],
  "insights": ["High satisfaction with service quality", "Opportunity to showcase customer success"]
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in extracting business insights and customer intelligence from social media content.'
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
        throw new Error('No response from GPT for insight extraction');
      }

      const insights = JSON.parse(content);
      
      return {
        themes: insights.themes || [],
        keywords: insights.keywords || [],
        brandMentions: insights.brandMentions || { positive: [], negative: [], neutral: [] },
        customerNeeds: insights.customerNeeds || [],
        opportunities: insights.opportunities || [],
        threats: insights.threats || [],
        insights: insights.insights || [],
        extractedAt: new Date()
      };

    } catch (error) {
      console.error('Insight extraction failed:', error);
      return {
        themes: [],
        keywords: [],
        brandMentions: { positive: [], negative: [], neutral: [] },
        customerNeeds: [],
        opportunities: [],
        threats: [],
        insights: [],
        extractedAt: new Date()
      };
    }
  }

  /**
   * Generate actionable recommendations
   */
  private async generateRecommendations(
    sentiment: any,
    emotions: EmotionAnalysis,
    urgency: UrgencyLevel
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Sentiment-based recommendations
    switch (sentiment.sentiment) {
      case 'delight':
        recommendations.push(
          'Share this positive feedback on company channels',
          'Thank the customer publicly and highlight their experience',
          'Use this as a case study for customer success stories'
        );
        break;
      case 'satisfaction':
        recommendations.push(
          'Acknowledge the positive feedback',
          'Consider asking for a review or testimonial',
          'Use insights to improve similar customer experiences'
        );
        break;
      case 'frustration':
        recommendations.push(
          'Respond quickly with empathy and understanding',
          'Offer immediate solutions or alternatives',
          'Follow up to ensure resolution and satisfaction'
        );
        break;
      case 'anger':
        recommendations.push(
          'Escalate to senior support immediately',
          'Offer sincere apologies and concrete solutions',
          'Provide compensation or goodwill gestures if appropriate'
        );
        break;
      case 'urgency':
        recommendations.push(
          'Respond within the recommended timeframe',
          'Provide clear next steps and timeline',
          'Keep customer updated on progress'
        );
        break;
    }

    // Urgency-based recommendations
    if (urgency.level >= 8) {
      recommendations.push(
        'Immediate escalation to crisis management team',
        'Prepare public response and communication plan',
        'Monitor for viral spread and media attention'
      );
    } else if (urgency.level >= 6) {
      recommendations.push(
        'Respond within 1-2 hours',
        'Prepare escalation plan if not resolved quickly',
        'Monitor for escalation signals'
      );
    }

    // Emotion-based recommendations
    if (emotions.primaryEmotion === 'fear') {
      recommendations.push(
        'Address concerns with facts and reassurance',
        'Provide clear safety or security information',
        'Offer support and resources'
      );
    } else if (emotions.primaryEmotion === 'surprise') {
      recommendations.push(
        'Clarify any misunderstandings quickly',
        'Provide context and explanation',
        'Turn surprise into positive opportunity'
      );
    }

    return recommendations;
  }

  /**
   * Monitor sentiment trends over time
   */
  async monitorSentimentTrends(
    orgId: string,
    platform: string,
    timeRange: 'day' | 'week' | 'month'
  ): Promise<TrendAlert[]> {
    // This would integrate with the database to analyze historical sentiment data
    const alerts: TrendAlert[] = [];

    // Mock trend analysis - in production this would query actual data
    const mockTrends = [
      {
        type: 'sentiment_shift' as const,
        severity: 'medium' as const,
        description: 'Sentiment shifted from positive to neutral over the past week',
        impact: 'Potential decrease in customer satisfaction',
        recommendations: ['Analyze recent changes', 'Review customer feedback', 'Adjust engagement strategy']
      },
      {
        type: 'urgency_spike' as const,
        severity: 'high' as const,
        description: 'Urgency levels increased by 40% in the last 24 hours',
        impact: 'Higher response pressure and potential crisis',
        recommendations: ['Increase response team capacity', 'Review escalation procedures', 'Monitor for crisis signals']
      }
    ];

    for (const trend of mockTrends) {
      alerts.push({
        id: `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orgId,
        platform,
        type: trend.type,
        severity: trend.severity,
        description: trend.description,
        impact: trend.impact,
        recommendations: trend.recommendations,
        detectedAt: new Date(),
        status: 'active'
      });
    }

    return alerts;
  }

  /**
   * Get sentiment analytics summary
   */
  async getSentimentAnalytics(
    orgId: string,
    timeRange: 'day' | 'week' | 'month'
  ): Promise<{
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
  }> {
    // This would query the database for actual analytics
    return {
      totalScans: 1250,
      sentimentDistribution: {
        delight: 45,
        satisfaction: 120,
        neutral: 85,
        frustration: 35,
        anger: 15,
        urgency: 25
      },
      averageConfidence: 0.87,
      topEmotions: [
        { emotion: 'joy', count: 180 },
        { emotion: 'trust', count: 150 },
        { emotion: 'anticipation', count: 120 },
        { emotion: 'fear', count: 45 },
        { emotion: 'anger', count: 30 }
      ],
      urgencyBreakdown: [
        { level: 1, count: 200 },
        { level: 2, count: 300 },
        { level: 3, count: 250 },
        { level: 4, count: 200 },
        { level: 5, count: 150 },
        { level: 6, count: 100 },
        { level: 7, count: 50 },
        { level: 8, count: 25 },
        { level: 9, count: 15 },
        { level: 10, count: 10 }
      ],
      responseTimeMetrics: {
        average: 2.5,
        median: 2.0,
        p95: 6.0
      }
    };
  }

  /**
   * Configure scanning parameters
   */
  updateScanConfiguration(config: {
    confidenceThreshold?: number;
    scanFrequency?: number;
    alertThresholds?: Record<string, number>;
  }): void {
    if (config.confidenceThreshold !== undefined) {
      this.confidenceThreshold = config.confidenceThreshold;
    }
    if (config.scanFrequency !== undefined) {
      this.scanFrequency = config.scanFrequency;
    }
  }

  /**
   * Validate content for scanning
   */
  private validateContent(content: string): boolean {
    if (!content || content.trim().length === 0) {
      return false;
    }
    
    if (content.length > 10000) {
      return false; // Content too long for analysis
    }
    
    return true;
  }
}
