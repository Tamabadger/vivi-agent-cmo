import { PlanTier } from '@vivi/common';

export enum EnhancedFeature {
  // Sprint 33: Voice-First Interaction Layer
  VOICE_COMMANDS_ADVANCED = 'VOICE_COMMANDS_ADVANCED',
  VOICE_TO_CAMPAIGN_PIPELINE = 'VOICE_TO_CAMPAIGN_PIPELINE',
  VOICE_RESPONSE_AUDIO = 'VOICE_RESPONSE_AUDIO',
  VOICE_AGENT_STORE_PACKS = 'VOICE_AGENT_STORE_PACKS',
  
  // Sprint 34: AI Media Engine
  VISION_REMIX_ENGINE = 'VISION_REMIX_ENGINE',
  AUTO_CLIPPER = 'AUTO_CLIPPER',
  FACELESS_VIDEO_GENERATION = 'FACELESS_VIDEO_GENERATION',
  VISUAL_PACKS_ACCESS = 'VISUAL_PACKS_ACCESS',
  AI_MEDIA_AGENT_STORE = 'AI_MEDIA_AGENT_STORE',
  
  // Sprint 35: Social Listening + Sentiment Intelligence
  SENTIMENT_SCANNING_REALTIME = 'SENTIMENT_SCANNING_REALTIME',
  TREND_LISTENING_ADVANCED = 'TREND_LISTENING_ADVANCED',
  EMOTION_ANALYSIS_DETAILED = 'EMOTION_ANALYSIS_DETAILED',
  URGENCY_DETECTION = 'URGENCY_DETECTION',
  VIVI_LISTEN_MODE = 'VIVI_LISTEN_MODE',
  
  // Sprint 36: Adaptive Learning Loop + Competitor Benchmarking
  LEARNING_LOOP_ENGINE = 'LEARNING_LOOP_ENGINE',
  COMPETITOR_SNAPSHOTS = 'COMPETITOR_SNAPSHOTS',
  COMPETITOR_SCORECARDS = 'COMPETITOR_SCORECARDS',
  PERFORMANCE_OPTIMIZATION = 'PERFORMANCE_OPTIMIZATION',
  COMPETITOR_INTELLIGENCE_PACK = 'COMPETITOR_INTELLIGENCE_PACK'
}

export interface EnhancedFeatureConfig {
  enabled: boolean;
  limit?: number;
  quota?: {
    period: 'month' | 'week' | 'day';
    limit: number;
  };
  revenueHook?: {
    type: 'tier_upgrade' | 'addon_pack' | 'agent_store';
    packId?: string;
    upgradePath?: PlanTier;
    pricing?: {
      monthly: number;
      yearly?: number;
    };
  };
}

export const ENHANCED_PLAN_FEATURES: Record<PlanTier, Record<EnhancedFeature, EnhancedFeatureConfig>> = {
  [PlanTier.LITE]: {
    // Sprint 33: Voice-First (Limited)
    [EnhancedFeature.VOICE_COMMANDS_ADVANCED]: { enabled: false },
    [EnhancedFeature.VOICE_TO_CAMPAIGN_PIPELINE]: { enabled: false },
    [EnhancedFeature.VOICE_RESPONSE_AUDIO]: { enabled: false },
    [EnhancedFeature.VOICE_AGENT_STORE_PACKS]: { 
      enabled: true,
      revenueHook: {
        type: 'agent_store',
        packId: 'voice-basic-pack',
        pricing: { monthly: 25 }
      }
    },
    
    // Sprint 34: AI Media Engine (Limited)
    [EnhancedFeature.VISION_REMIX_ENGINE]: { enabled: false },
    [EnhancedFeature.AUTO_CLIPPER]: { enabled: false },
    [EnhancedFeature.FACELESS_VIDEO_GENERATION]: { enabled: false },
    [EnhancedFeature.VISUAL_PACKS_ACCESS]: { 
      enabled: true,
      revenueHook: {
        type: 'agent_store',
        packId: 'visual-basic-pack',
        pricing: { monthly: 35 }
      }
    },
    [EnhancedFeature.AI_MEDIA_AGENT_STORE]: { enabled: true },
    
    // Sprint 35: Social Listening (Limited)
    [EnhancedFeature.SENTIMENT_SCANNING_REALTIME]: { enabled: false },
    [EnhancedFeature.TREND_LISTENING_ADVANCED]: { enabled: false },
    [EnhancedFeature.EMOTION_ANALYSIS_DETAILED]: { enabled: false },
    [EnhancedFeature.URGENCY_DETECTION]: { enabled: false },
    [EnhancedFeature.VIVI_LISTEN_MODE]: { 
      enabled: true,
      revenueHook: {
        type: 'addon_pack',
        packId: 'listen-mode-lite',
        pricing: { monthly: 45 }
      }
    },
    
    // Sprint 36: Learning & Competitor (Limited)
    [EnhancedFeature.LEARNING_LOOP_ENGINE]: { enabled: false },
    [EnhancedFeature.COMPETITOR_SNAPSHOTS]: { enabled: false },
    [EnhancedFeature.COMPETITOR_SCORECARDS]: { enabled: false },
    [EnhancedFeature.PERFORMANCE_OPTIMIZATION]: { enabled: false },
    [EnhancedFeature.COMPETITOR_INTELLIGENCE_PACK]: { 
      enabled: true,
      revenueHook: {
        type: 'agent_store',
        packId: 'competitor-basic-pack',
        pricing: { monthly: 55 }
      }
    }
  },
  
  [PlanTier.PLUS]: {
    // Sprint 33: Voice-First (Enhanced)
    [EnhancedFeature.VOICE_COMMANDS_ADVANCED]: { enabled: true },
    [EnhancedFeature.VOICE_TO_CAMPAIGN_PIPELINE]: { enabled: true },
    [EnhancedFeature.VOICE_RESPONSE_AUDIO]: { enabled: false },
    [EnhancedFeature.VOICE_AGENT_STORE_PACKS]: { 
      enabled: true,
      revenueHook: {
        type: 'agent_store',
        packId: 'voice-pro-pack',
        pricing: { monthly: 40 }
      }
    },
    
    // Sprint 34: AI Media Engine (Enhanced)
    [EnhancedFeature.VISION_REMIX_ENGINE]: { enabled: false },
    [EnhancedFeature.AUTO_CLIPPER]: { enabled: true, quota: { period: 'month', limit: 10 } },
    [EnhancedFeature.FACELESS_VIDEO_GENERATION]: { enabled: false },
    [EnhancedFeature.VISUAL_PACKS_ACCESS]: { 
      enabled: true,
      revenueHook: {
        type: 'agent_store',
        packId: 'visual-pro-pack',
        pricing: { monthly: 50 }
      }
    },
    [EnhancedFeature.AI_MEDIA_AGENT_STORE]: { enabled: true },
    
    // Sprint 35: Social Listening (Enhanced)
    [EnhancedFeature.SENTIMENT_SCANNING_REALTIME]: { enabled: true },
    [EnhancedFeature.TREND_LISTENING_ADVANCED]: { enabled: true },
    [EnhancedFeature.EMOTION_ANALYSIS_DETAILED]: { enabled: false },
    [EnhancedFeature.URGENCY_DETECTION]: { enabled: true },
    [EnhancedFeature.VIVI_LISTEN_MODE]: { 
      enabled: true,
      revenueHook: {
        type: 'addon_pack',
        packId: 'listen-mode-plus',
        pricing: { monthly: 65 }
      }
    },
    
    // Sprint 36: Learning & Competitor (Enhanced)
    [EnhancedFeature.LEARNING_LOOP_ENGINE]: { enabled: false },
    [EnhancedFeature.COMPETITOR_SNAPSHOTS]: { enabled: true, quota: { period: 'month', limit: 5 } },
    [EnhancedFeature.COMPETITOR_SCORECARDS]: { enabled: false },
    [EnhancedFeature.PERFORMANCE_OPTIMIZATION]: { enabled: false },
    [EnhancedFeature.COMPETITOR_INTELLIGENCE_PACK]: { 
      enabled: true,
      revenueHook: {
        type: 'agent_store',
        packId: 'competitor-pro-pack',
        pricing: { monthly: 75 }
      }
    }
  },
  
  [PlanTier.PRO]: {
    // Sprint 33: Voice-First (Professional)
    [EnhancedFeature.VOICE_COMMANDS_ADVANCED]: { enabled: true },
    [EnhancedFeature.VOICE_TO_CAMPAIGN_PIPELINE]: { enabled: true },
    [EnhancedFeature.VOICE_RESPONSE_AUDIO]: { enabled: true },
    [EnhancedFeature.VOICE_AGENT_STORE_PACKS]: { 
      enabled: true,
      revenueHook: {
        type: 'agent_store',
        packId: 'voice-enterprise-pack',
        pricing: { monthly: 60 }
      }
    },
    
    // Sprint 34: AI Media Engine (Professional)
    [EnhancedFeature.VISION_REMIX_ENGINE]: { enabled: true, quota: { period: 'month', limit: 25 } },
    [EnhancedFeature.AUTO_CLIPPER]: { enabled: true, quota: { period: 'month', limit: 50 } },
    [EnhancedFeature.FACELESS_VIDEO_GENERATION]: { enabled: true, quota: { period: 'month', limit: 20 } },
    [EnhancedFeature.VISUAL_PACKS_ACCESS]: { 
      enabled: true,
      revenueHook: {
        type: 'agent_store',
        packId: 'visual-enterprise-pack',
        pricing: { monthly: 75 }
      }
    },
    [EnhancedFeature.AI_MEDIA_AGENT_STORE]: { enabled: true },
    
    // Sprint 35: Social Listening (Professional)
    [EnhancedFeature.SENTIMENT_SCANNING_REALTIME]: { enabled: true },
    [EnhancedFeature.TREND_LISTENING_ADVANCED]: { enabled: true },
    [EnhancedFeature.EMOTION_ANALYSIS_DETAILED]: { enabled: true },
    [EnhancedFeature.URGENCY_DETECTION]: { enabled: true },
    [EnhancedFeature.VIVI_LISTEN_MODE]: { 
      enabled: true,
      revenueHook: {
        type: 'addon_pack',
        packId: 'listen-mode-pro',
        pricing: { monthly: 85 }
      }
    },
    
    // Sprint 36: Learning & Competitor (Professional)
    [EnhancedFeature.LEARNING_LOOP_ENGINE]: { enabled: true },
    [EnhancedFeature.COMPETITOR_SNAPSHOTS]: { enabled: true, quota: { period: 'month', limit: 20 } },
    [EnhancedFeature.COMPETITOR_SCORECARDS]: { enabled: true },
    [EnhancedFeature.PERFORMANCE_OPTIMIZATION]: { enabled: true },
    [EnhancedFeature.COMPETITOR_INTELLIGENCE_PACK]: { 
      enabled: true,
      revenueHook: {
        type: 'agent_store',
        packId: 'competitor-enterprise-pack',
        pricing: { monthly: 95 }
      }
    }
  },
  
  [PlanTier.PRIME]: {
    // Sprint 33: Voice-First (Prime - Full Access)
    [EnhancedFeature.VOICE_COMMANDS_ADVANCED]: { enabled: true },
    [EnhancedFeature.VOICE_TO_CAMPAIGN_PIPELINE]: { enabled: true },
    [EnhancedFeature.VOICE_RESPONSE_AUDIO]: { enabled: true },
    [EnhancedFeature.VOICE_AGENT_STORE_PACKS]: { enabled: true },
    
    // Sprint 34: AI Media Engine (Prime - Full Access)
    [EnhancedFeature.VISION_REMIX_ENGINE]: { enabled: true },
    [EnhancedFeature.AUTO_CLIPPER]: { enabled: true },
    [EnhancedFeature.FACELESS_VIDEO_GENERATION]: { enabled: true },
    [EnhancedFeature.VISUAL_PACKS_ACCESS]: { enabled: true },
    [EnhancedFeature.AI_MEDIA_AGENT_STORE]: { enabled: true },
    
    // Sprint 35: Social Listening (Prime - Full Access)
    [EnhancedFeature.SENTIMENT_SCANNING_REALTIME]: { enabled: true },
    [EnhancedFeature.TREND_LISTENING_ADVANCED]: { enabled: true },
    [EnhancedFeature.EMOTION_ANALYSIS_DETAILED]: { enabled: true },
    [EnhancedFeature.URGENCY_DETECTION]: { enabled: true },
    [EnhancedFeature.VIVI_LISTEN_MODE]: { enabled: true },
    
    // Sprint 36: Learning & Competitor (Prime - Full Access)
    [EnhancedFeature.LEARNING_LOOP_ENGINE]: { enabled: true },
    [EnhancedFeature.COMPETITOR_SNAPSHOTS]: { enabled: true },
    [EnhancedFeature.COMPETITOR_SCORECARDS]: { enabled: true },
    [EnhancedFeature.PERFORMANCE_OPTIMIZATION]: { enabled: true },
    [EnhancedFeature.COMPETITOR_INTELLIGENCE_PACK]: { enabled: true }
  }
};

export class EnhancedEntitlementsService {
  /**
   * Check if an enhanced feature is enabled for a given plan tier
   */
  static hasEnhancedFeature(plan: PlanTier, feature: EnhancedFeature): boolean {
    const planFeatures = ENHANCED_PLAN_FEATURES[plan];
    if (!planFeatures) {
      return false;
    }
    
    const featureConfig = planFeatures[feature];
    return featureConfig?.enabled || false;
  }

  /**
   * Get the limit for an enhanced feature on a given plan tier
   */
  static getEnhancedFeatureLimit(plan: PlanTier, feature: EnhancedFeature): number | undefined {
    const planFeatures = ENHANCED_PLAN_FEATURES[plan];
    if (!planFeatures) {
      return undefined;
    }
    
    const featureConfig = planFeatures[feature];
    return featureConfig?.limit;
  }

  /**
   * Get revenue hook information for an enhanced feature
   */
  static getEnhancedFeatureRevenueHook(plan: PlanTier, feature: EnhancedFeature) {
    const planFeatures = ENHANCED_PLAN_FEATURES[plan];
    if (!planFeatures) {
      return undefined;
    }
    
    const featureConfig = planFeatures[feature];
    return featureConfig?.revenueHook;
  }

  /**
   * Get all enhanced features with their configuration for a plan tier
   */
  static getEnhancedPlanFeatures(plan: PlanTier): Record<EnhancedFeature, EnhancedFeatureConfig> {
    return ENHANCED_PLAN_FEATURES[plan] || {};
  }

  /**
   * Check if a plan tier supports voice-first interaction
   */
  static supportsVoiceFirst(plan: PlanTier): boolean {
    return this.hasEnhancedFeature(plan, EnhancedFeature.VOICE_COMMANDS_ADVANCED) ||
           this.hasEnhancedFeature(plan, EnhancedFeature.VOICE_TO_CAMPAIGN_PIPELINE);
  }

  /**
   * Check if a plan tier supports AI media generation
   */
  static supportsAIMedia(plan: PlanTier): boolean {
    return this.hasEnhancedFeature(plan, EnhancedFeature.VISION_REMIX_ENGINE) ||
           this.hasEnhancedFeature(plan, EnhancedFeature.FACELESS_VIDEO_GENERATION);
  }

  /**
   * Check if a plan tier supports advanced sentiment analysis
   */
  static supportsAdvancedSentiment(plan: PlanTier): boolean {
    return this.hasEnhancedFeature(plan, EnhancedFeature.EMOTION_ANALYSIS_DETAILED) ||
           this.hasEnhancedFeature(plan, EnhancedFeature.URGENCY_DETECTION);
  }

  /**
   * Check if a plan tier supports learning loops
   */
  static supportsLearningLoops(plan: PlanTier): boolean {
    return this.hasEnhancedFeature(plan, EnhancedFeature.LEARNING_LOOP_ENGINE) ||
           this.hasEnhancedFeature(plan, EnhancedFeature.PERFORMANCE_OPTIMIZATION);
  }

  /**
   * Check if a plan tier supports competitor intelligence
   */
  static supportsCompetitorIntelligence(plan: PlanTier): boolean {
    return this.hasEnhancedFeature(plan, EnhancedFeature.COMPETITOR_SCORECARDS) ||
           this.hasEnhancedFeature(plan, EnhancedFeature.COMPETITOR_INTELLIGENCE_PACK);
  }
}
