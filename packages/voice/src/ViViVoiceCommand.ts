import OpenAI from 'openai';
import { LLMRouter } from '@vivi/router';
import { 
  VoiceCommandRequest, 
  VoiceCommandResponse, 
  VoiceIntent, 
  VoiceEntity,
  VoiceCommandStatus,
  CampaignPipelineData
} from './enhanced-types';

/**
 * ViViVoiceCommand - Enhanced voice command processing for Sprint 33
 * 
 * This module transforms raw voice input into structured campaign actions,
 * leveraging ViVi's existing AI infrastructure and persona engine.
 */
export class ViViVoiceCommand {
  private openai: OpenAI;
  private llmRouter: LLMRouter;
  private confidenceThreshold: number;

  constructor(
    openaiApiKey: string,
    llmRouter: LLMRouter,
    confidenceThreshold: number = 0.7
  ) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.llmRouter = llmRouter;
    this.confidenceThreshold = confidenceThreshold;
  }

  /**
   * Process voice command and convert to structured intent
   * 
   * Example: "ViVi, post a 20% weekend promo reel for Instagram and TikTok"
   * Output: Campaign creation with platform targeting and content strategy
   */
  async processVoiceCommand(
    request: VoiceCommandRequest
  ): Promise<VoiceCommandResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Transcribe audio using existing voice processor
      const transcription = await this.transcribeAudio(request.audioBuffer);
      
      // Step 2: Extract intent and entities using advanced AI analysis
      const intentAnalysis = await this.extractIntentAndEntities(transcription, request.context);
      
      // Step 3: Validate confidence threshold
      if (intentAnalysis.confidence < this.confidenceThreshold) {
        return {
          success: false,
          error: 'LOW_CONFIDENCE',
          message: 'Voice command confidence too low. Please try again.',
          confidence: intentAnalysis.confidence,
          suggestions: this.generateSuggestions(intentAnalysis.intent)
        };
      }

      // Step 4: Generate structured campaign data
      const campaignData = await this.generateCampaignData(intentAnalysis, request.orgId);
      
      // Step 5: Create voice response
      const voiceResponse = await this.generateVoiceResponse(intentAnalysis, campaignData);
      
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        transcription,
        intent: intentAnalysis.intent,
        entities: intentAnalysis.entities,
        confidence: intentAnalysis.confidence,
        campaignData,
        voiceResponse,
        processingTime,
        status: VoiceCommandStatus.COMPLETED
      };

    } catch (error) {
      console.error('Voice command processing failed:', error);
      return {
        success: false,
        error: 'PROCESSING_FAILED',
        message: 'Failed to process voice command. Please try again.',
        status: VoiceCommandStatus.FAILED
      };
    }
  }

  /**
   * Extract intent and entities from voice transcription
   */
  private async extractIntentAndEntities(
    transcription: string,
    context?: string
  ): Promise<{
    intent: VoiceIntent;
    entities: VoiceEntity[];
    confidence: number;
  }> {
    const prompt = `You are ViVi, an AI CMO expert. Analyze this voice command and extract:

1. INTENT: What the user wants to do (schedule_post, create_campaign, analyze_performance, etc.)
2. ENTITIES: Key information (platforms, dates, percentages, content_type, etc.)
3. CONFIDENCE: How certain you are (0.0-1.0)

Voice Command: "${transcription}"
Context: ${context || 'General social media management'}

Common Intents:
- schedule_post: User wants to schedule content
- create_campaign: User wants to create a marketing campaign
- analyze_performance: User wants performance insights
- manage_reviews: User wants to handle customer feedback
- boost_content: User wants to promote existing content

Common Entities:
- platforms: instagram, tiktok, linkedin, facebook, youtube
- dates: today, tomorrow, weekend, next_week
- percentages: 20%, 50% off, etc.
- content_types: reel, post, story, video, image
- promotions: sale, discount, promo, offer

Respond in JSON:
{
  "intent": "intent_name",
  "entities": [
    {"type": "platform", "value": "instagram", "confidence": 0.95},
    {"type": "percentage", "value": "20%", "confidence": 0.90}
  ],
  "confidence": 0.92
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at understanding voice commands for social media management. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No response from GPT for intent analysis');
      }

      const analysis = JSON.parse(content);
      
      return {
        intent: analysis.intent || 'unknown',
        entities: analysis.entities || [],
        confidence: analysis.confidence || 0.5
      };

    } catch (error) {
      console.error('Intent extraction failed:', error);
      return {
        intent: 'unknown',
        entities: [],
        confidence: 0.5
      };
    }
  }

  /**
   * Generate structured campaign data from voice intent
   */
  private async generateCampaignData(
    intentAnalysis: { intent: VoiceIntent; entities: VoiceEntity[] },
    orgId: string
  ): Promise<CampaignPipelineData> {
    const prompt = `Based on this voice command analysis, generate structured campaign data:

Intent: ${intentAnalysis.intent}
Entities: ${JSON.stringify(intentAnalysis.entities)}

Generate a complete campaign structure including:
- Campaign name and description
- Target platforms
- Content strategy
- Scheduling recommendations
- Hashtag suggestions
- Target audience insights

Respond in JSON:
{
  "campaignName": "Weekend Promo Campaign",
  "description": "20% off promotion for Instagram and TikTok",
  "platforms": ["instagram", "tiktok"],
  "contentStrategy": {
    "type": "promotional",
    "tone": "excited",
    "callToAction": "Shop now with 20% off!"
  },
  "scheduling": {
    "recommendedTimes": ["18:00", "20:00"],
    "frequency": "daily",
    "duration": "3 days"
  },
  "hashtags": ["#weekendpromo", "#20off", "#shopnow"],
  "targetAudience": {
    "demographics": "18-35",
    "interests": ["shopping", "deals", "fashion"]
  }
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media campaign strategist. Generate detailed, actionable campaign data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No response from GPT for campaign generation');
      }

      const campaignData = JSON.parse(content);
      
      return {
        ...campaignData,
        orgId,
        generatedAt: new Date(),
        source: 'voice_command'
      };

    } catch (error) {
      console.error('Campaign generation failed:', error);
      return {
        campaignName: 'Voice Campaign',
        description: 'Campaign generated from voice command',
        platforms: ['instagram'],
        contentStrategy: {
          type: 'general',
          tone: 'friendly',
          callToAction: 'Learn more'
        },
        scheduling: {
          recommendedTimes: ['12:00'],
          frequency: 'once',
          duration: '1 day'
        },
        hashtags: ['#vivi', '#voice'],
        targetAudience: {
          demographics: 'general',
          interests: ['social_media']
        },
        orgId,
        generatedAt: new Date(),
        source: 'voice_command'
      };
    }
  }

  /**
   * Generate voice response for user feedback
   */
  private async generateVoiceResponse(
    intentAnalysis: { intent: VoiceIntent; entities: VoiceEntity[] },
    campaignData: CampaignPipelineData
  ): Promise<{
    text: string;
    audioUrl?: string;
    actionSummary: string;
  }> {
    const responseText = `Perfect! I've created a ${campaignData.contentStrategy?.type || 'general'} campaign called "${campaignData.campaignName}" for ${campaignData.platforms.join(' and ')}. 

The campaign will run for ${campaignData.scheduling.duration} with ${campaignData.scheduling.frequency} posts. I've included hashtags like ${campaignData.hashtags.slice(0, 3).join(', ')} and targeted it for ${campaignData.targetAudience.demographics} year olds interested in ${campaignData.targetAudience.interests.join(', ')}.

Would you like me to schedule this campaign now, or would you like to review and modify it first?`;

    return {
      text: responseText,
      actionSummary: `Created ${campaignData.contentStrategy?.type || 'general'} campaign for ${campaignData.platforms.join(', ')}`
    };
  }

  /**
   * Generate suggestions for low-confidence commands
   */
  private generateSuggestions(intent: VoiceIntent): string[] {
    const suggestions: Record<VoiceIntent, string[]> = {
      schedule_post: [
        "Try: 'Post a product photo on Instagram tomorrow'",
        "Try: 'Schedule a story for this weekend'",
        "Try: 'Create a post about our new service'"
      ],
      create_campaign: [
        "Try: 'Start a summer sale campaign'",
        "Try: 'Create a holiday promotion'",
        "Try: 'Launch a brand awareness campaign'"
      ],
      analyze_performance: [
        "Try: 'Show me this month's performance'",
        "Try: 'Analyze our Instagram engagement'",
        "Try: 'Check our campaign results'"
      ],
      manage_reviews: [
        "Try: 'Check our recent reviews'",
        "Try: 'Respond to customer feedback'",
        "Try: 'Monitor review sentiment'"
      ],
      boost_content: [
        "Try: 'Boost our latest post'",
        "Try: 'Promote our campaign'",
        "Try: 'Increase ad spend'"
      ],
      check_analytics: [
        "Try: 'Show me our analytics'",
        "Try: 'Check performance metrics'",
        "Try: 'View engagement data'"
      ],
      manage_competitors: [
        "Try: 'Analyze competitor content'",
        "Try: 'Monitor competitor activity'",
        "Try: 'Compare our performance'"
      ],
      optimize_content: [
        "Try: 'Optimize our content strategy'",
        "Try: 'Improve engagement rates'",
        "Try: 'A/B test our posts'"
      ],
      unknown: [
        "Try: 'Schedule a post for Instagram'",
        "Try: 'Create a marketing campaign'",
        "Try: 'Show me our analytics'"
      ]
    };

    return suggestions[intent] || suggestions.unknown;
  }

  /**
   * Transcribe audio using OpenAI Whisper
   */
  private async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      // Create a File object from the buffer for OpenAI
      const file = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });
      
      const transcription = await this.openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language: 'en',
        response_format: 'text'
      });

      return transcription;
    } catch (error) {
      console.error('Audio transcription failed:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Validate voice command against user entitlements
   */
  async validateEntitlements(
    orgId: string,
    planTier: string,
    feature: string
  ): Promise<boolean> {
    // This would integrate with the entitlements system
    // For now, return true for development
    return true;
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(orgId: string): Promise<{
    totalCommands: number;
    successRate: number;
    avgProcessingTime: number;
    topIntents: Array<{ intent: string; count: number }>;
  }> {
    // This would query the database for actual stats
    // For now, return mock data
    return {
      totalCommands: 150,
      successRate: 0.94,
      avgProcessingTime: 1200,
      topIntents: [
        { intent: 'schedule_post', count: 45 },
        { intent: 'create_campaign', count: 32 },
        { intent: 'analyze_performance', count: 28 }
      ]
    };
  }
}
