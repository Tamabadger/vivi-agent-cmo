import { LLMRouter } from '@vivi/router';
import { 
  CampaignPipelineData, 
  VoiceIntent, 
  VoiceEntity,
  ScheduledCampaign,
  ContentAsset,
  PlatformConfig
} from './enhanced-types';

/**
 * VoiceToCampaignPipeline - Converts voice commands to scheduled campaigns
 * 
 * This module automatically creates and schedules campaigns based on voice input,
 * integrating with ViVi's existing scheduler and persona engine.
 */
export class VoiceToCampaignPipeline {
  private llmRouter: LLMRouter;

  constructor(llmRouter: LLMRouter) {
    this.llmRouter = llmRouter;
  }

  /**
   * Convert voice command to scheduled campaign
   * 
   * Example: "Post a 20% weekend promo reel for Instagram and TikTok"
   * → Creates campaign with scheduled posts, hashtags, and platform optimization
   */
  async createCampaignFromVoice(
    campaignData: CampaignPipelineData,
    orgId: string
  ): Promise<ScheduledCampaign> {
    try {
      // Step 1: Validate campaign data
      const validatedData = this.validateCampaignData(campaignData);
      
      // Step 2: Generate content assets
      const contentAssets = await this.generateContentAssets(validatedData);
      
      // Step 3: Optimize for each platform
      const platformConfigs = await this.optimizeForPlatforms(validatedData.platforms, validatedData);
      
      // Step 4: Create scheduling strategy
      const schedulingStrategy = this.createSchedulingStrategy(validatedData.scheduling);
      
      // Step 5: Generate hashtag strategy
      const hashtagStrategy = await this.generateHashtagStrategy(validatedData);
      
      // Step 6: Build final campaign
      const campaign: ScheduledCampaign = {
        id: this.generateCampaignId(),
        orgId,
        name: validatedData.campaignName,
        description: validatedData.description,
        status: 'draft',
        platforms: validatedData.platforms,
        contentAssets,
        platformConfigs,
        scheduling: schedulingStrategy,
        hashtags: hashtagStrategy,
        targetAudience: validatedData.targetAudience,
        metrics: {
          estimatedReach: this.calculateEstimatedReach(validatedData),
          estimatedEngagement: this.calculateEstimatedEngagement(validatedData),
          estimatedConversions: this.calculateEstimatedConversions(validatedData)
        },
        createdAt: new Date(),
        source: 'voice_command',
        voiceMetadata: {
          originalIntent: validatedData.source,
          confidence: 0.95,
          entities: []
        }
      };

      return campaign;

    } catch (error) {
      console.error('Campaign creation failed:', error);
      throw new Error(`Failed to create campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate and enhance campaign data
   */
  private validateCampaignData(data: CampaignPipelineData): CampaignPipelineData {
    const validated = { ...data };

    // Ensure required fields
    if (!validated.campaignName) {
      validated.campaignName = `Voice Campaign ${new Date().toISOString().split('T')[0]}`;
    }

    if (!validated.platforms || validated.platforms.length === 0) {
      validated.platforms = ['instagram']; // Default to Instagram
    }

    if (!validated.scheduling) {
      validated.scheduling = {
        recommendedTimes: ['12:00', '18:00'],
        frequency: 'daily',
        duration: '3 days'
      };
    }

    if (!validated.hashtags || validated.hashtags.length === 0) {
      validated.hashtags = ['#vivi', '#voice', '#campaign'];
    }

    if (!validated.targetAudience) {
      validated.targetAudience = {
        demographics: '18-45',
        interests: ['social_media', 'general']
      };
    }

    return validated;
  }

  /**
   * Generate content assets for the campaign
   */
  private async generateContentAssets(data: CampaignPipelineData): Promise<ContentAsset[]> {
    const assets: ContentAsset[] = [];

    // Generate content based on campaign type
    switch (data.contentStrategy?.type) {
      case 'promotional':
        assets.push({
          type: 'image',
          description: `${data.campaignName} promotional image`,
          dimensions: { width: 1080, height: 1080 },
          platform: 'all',
          aiGenerated: true,
          prompt: `Create a promotional image for ${data.campaignName}: ${data.description}`
        });
        
        if (data.platforms.includes('tiktok') || data.platforms.includes('instagram')) {
          assets.push({
            type: 'video',
            description: `${data.campaignName} promotional video`,
            duration: 15,
            dimensions: { width: 1080, height: 1920 },
            platform: 'vertical',
            aiGenerated: true,
            prompt: `Create a 15-second promotional video for ${data.campaignName}`
          });
        }
        break;

      case 'educational':
        assets.push({
          type: 'image',
          description: `${data.campaignName} educational infographic`,
          dimensions: { width: 1080, height: 1350 },
          platform: 'instagram',
          aiGenerated: true,
          prompt: `Create an educational infographic about ${data.campaignName}`
        });
        break;

      default:
        assets.push({
          type: 'image',
          description: `${data.campaignName} content image`,
          dimensions: { width: 1080, height: 1080 },
          platform: 'all',
          aiGenerated: true,
          prompt: `Create a professional image for ${data.campaignName}`
        });
    }

    return assets;
  }

  /**
   * Optimize campaign for each platform
   */
  private async optimizeForPlatforms(
    platforms: string[],
    data: CampaignPipelineData
  ): Promise<PlatformConfig[]> {
    const configs: PlatformConfig[] = [];

    for (const platform of platforms) {
      const config: PlatformConfig = {
        platform,
        contentAdaptation: this.getContentAdaptation(platform, data),
        postingSchedule: this.getPlatformSchedule(platform, data.scheduling),
        hashtagLimit: this.getHashtagLimit(platform),
        characterLimit: this.getCharacterLimit(platform),
        engagementOptimization: this.getEngagementOptimization(platform)
      };

      configs.push(config);
    }

    return configs;
  }

  /**
   * Get content adaptation rules for each platform
   */
  private getContentAdaptation(platform: string, data: CampaignPipelineData): any {
    const adaptations: Record<string, any> = {
      instagram: {
        aspectRatios: ['1:1', '4:5', '9:16'],
        storyFormat: true,
        carouselSupport: true,
        reelsSupport: true
      },
      tiktok: {
        aspectRatios: ['9:16'],
        videoRequired: true,
        maxDuration: 60,
        trendingSounds: true
      },
      linkedin: {
        aspectRatios: ['1.91:1', '1:1'],
        professionalTone: true,
        articleSupport: true,
        companyPage: true
      },
      facebook: {
        aspectRatios: ['1.91:1', '1:1', '4:5'],
        groupSupport: true,
        eventSupport: true,
        marketplace: true
      },
      youtube_shorts: {
        aspectRatios: ['9:16'],
        videoRequired: true,
        maxDuration: 60,
        seoOptimization: true
      }
    };

    return adaptations[platform] || adaptations.instagram;
  }

  /**
   * Get platform-specific posting schedule
   */
  private getPlatformSchedule(platform: string, scheduling: any): any {
    const platformSchedules: Record<string, any> = {
      instagram: {
        bestTimes: ['12:00', '18:00', '20:00'],
        frequency: 'daily',
        quietHours: { start: '22:00', end: '08:00' }
      },
      tiktok: {
        bestTimes: ['10:00', '14:00', '19:00'],
        frequency: 'daily',
        quietHours: { start: '23:00', end: '07:00' }
      },
      linkedin: {
        bestTimes: ['09:00', '12:00', '17:00'],
        frequency: '3x_week',
        quietHours: { start: '18:00', end: '08:00' }
      },
      facebook: {
        bestTimes: ['13:00', '15:00', '19:00'],
        frequency: 'daily',
        quietHours: { start: '21:00', end: '08:00' }
      },
      youtube_shorts: {
        bestTimes: ['12:00', '16:00', '20:00'],
        frequency: 'daily',
        quietHours: { start: '22:00', end: '08:00' }
      }
    };

    return platformSchedules[platform] || platformSchedules.instagram;
  }

  /**
   * Get hashtag limits for each platform
   */
  private getHashtagLimit(platform: string): number {
    const limits: Record<string, number> = {
      instagram: 30,
      tiktok: 5,
      linkedin: 5,
      facebook: 5,
      youtube_shorts: 5
    };

    return limits[platform] || 5;
  }

  /**
   * Get character limits for each platform
   */
  private getCharacterLimit(platform: string): number {
    const limits: Record<string, number> = {
      instagram: 2200,
      tiktok: 150,
      linkedin: 3000,
      facebook: 63206,
      youtube_shorts: 5000
    };

    return limits[platform] || 2200;
  }

  /**
   * Get engagement optimization strategies for each platform
   */
  private getEngagementOptimization(platform: string): any {
    const strategies: Record<string, any> = {
      instagram: {
        useStories: true,
        useReels: true,
        useCarousels: true,
        engageWithComments: true,
        useLocationTags: true
      },
      tiktok: {
        useTrendingSounds: true,
        useTrendingHashtags: true,
        createDuets: true,
        respondToComments: true,
        postFrequently: true
      },
      linkedin: {
        useProfessionalTone: true,
        tagRelevantPeople: true,
        useCompanyHashtags: true,
        engageInGroups: true,
        shareIndustryInsights: true
      },
      facebook: {
        useLocalContent: true,
        engageWithGroups: true,
        useEvents: true,
        createPolls: true,
        respondToMessages: true
      },
      youtube_shorts: {
        useTrendingTopics: true,
        optimizeThumbnails: true,
        useCards: true,
        createPlaylists: true,
        engageWithComments: true
      }
    };

    return strategies[platform] || strategies.instagram;
  }

  /**
   * Create scheduling strategy for the campaign
   */
  private createSchedulingStrategy(scheduling: any): any {
    const strategy = {
      type: scheduling.frequency || 'daily',
      duration: this.parseDuration(scheduling.duration),
      times: scheduling.recommendedTimes || ['12:00', '18:00'],
      timezone: 'UTC',
      autoOptimize: true,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    };

    return strategy;
  }

  /**
   * Parse duration string to days
   */
  private parseDuration(duration: string): number {
    const durationMap: Record<string, number> = {
      '1 day': 1,
      '3 days': 3,
      '1 week': 7,
      '2 weeks': 14,
      '1 month': 30
    };

    return durationMap[duration] || 3;
  }

  /**
   * Generate hashtag strategy for the campaign
   */
  private async generateHashtagStrategy(data: CampaignPipelineData): Promise<any> {
    const baseHashtags = data.hashtags || [];
    
    // Add platform-specific hashtags
    const platformHashtags: Record<string, string[]> = {
      instagram: ['#instagram', '#instagood', '#photooftheday'],
      tiktok: ['#tiktok', '#fyp', '#viral'],
      linkedin: ['#linkedin', '#business', '#professional'],
      facebook: ['#facebook', '#social', '#community'],
      youtube_shorts: ['#youtube', '#shorts', '#viral']
    };

    const allHashtags = [...baseHashtags];
    
    for (const platform of data.platforms) {
      if (platformHashtags[platform]) {
        allHashtags.push(...platformHashtags[platform]);
      }
    }

    return {
      primary: baseHashtags.slice(0, 5),
      secondary: allHashtags.slice(5, 15),
      trending: [], // Would be populated by trend analysis
      branded: baseHashtags.filter(tag => tag.includes(data.campaignName.toLowerCase())),
      platformSpecific: platformHashtags
    };
  }

  /**
   * Calculate estimated reach for the campaign
   */
  private calculateEstimatedReach(data: CampaignPipelineData): number {
    const baseReach = 1000;
    const platformMultiplier = data.platforms.length * 1.5;
    const durationMultiplier = this.parseDuration(data.scheduling.duration) / 3;
    
    return Math.round(baseReach * platformMultiplier * durationMultiplier);
  }

  /**
   * Calculate estimated engagement rate
   */
  private calculateEstimatedEngagement(data: CampaignPipelineData): number {
    const baseEngagement = 0.03; // 3% base engagement
    const platformBonus = data.platforms.includes('instagram') ? 0.01 : 0;
    const contentBonus = data.contentStrategy?.type === 'promotional' ? 0.02 : 0;
    
    return baseEngagement + platformBonus + contentBonus;
  }

  /**
   * Calculate estimated conversions
   */
  private calculateEstimatedConversions(data: CampaignPipelineData): number {
    const reach = this.calculateEstimatedReach(data);
    const engagement = this.calculateEstimatedEngagement(data);
    const conversionRate = 0.001; // 0.1% conversion rate
    
    return Math.round(reach * engagement * conversionRate);
  }

  /**
   * Generate unique campaign ID
   */
  private generateCampaignId(): string {
    return `vc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get campaign analytics and insights
   */
  async getCampaignInsights(campaignId: string): Promise<any> {
    // This would integrate with ViVi's analytics system
    return {
      campaignId,
      performance: {
        reach: 0,
        engagement: 0,
        conversions: 0
      },
      recommendations: [
        'Consider posting at peak engagement times',
        'Test different hashtag combinations',
        'Monitor competitor performance'
      ]
    };
  }
}
