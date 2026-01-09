import { PlanTier } from '@vivi/common';

export enum Feature {
  // Platform flags
  PLATFORM_IG_FB_GBP = 'PLATFORM_IG_FB_GBP',
  PLATFORM_TIKTOK = 'PLATFORM_TIKTOK',
  PLATFORM_LINKEDIN = 'PLATFORM_LINKEDIN',
  PLATFORM_YT_SHORTS = 'PLATFORM_YT_SHORTS',
  
  // Scheduler/Composer
  SCHEDULER_LIMITED_25 = 'SCHEDULER_LIMITED_25',
  SCHEDULER_UNLIMITED = 'SCHEDULER_UNLIMITED',
  CAPTION_VARIANTS_2 = 'CAPTION_VARIANTS_2',
  CAPTION_VARIANTS_3 = 'CAPTION_VARIANTS_3',
  
  // TrendTap
  TRENDTAP_TEASER = 'TRENDTAP_TEASER',
  TRENDTAP_STANDARD = 'TRENDTAP_STANDARD',
  TRENDTAP_PRO = 'TRENDTAP_PRO',
  
  // Listen
  LISTEN_DIGEST = 'LISTEN_DIGEST',
  LISTEN_INBOX = 'LISTEN_INBOX',
  LISTEN_CLASSIFY = 'LISTEN_CLASSIFY',
  LISTEN_FULL = 'LISTEN_FULL',
  
  // Grow
  REVIEWS_REPLY_15 = 'REVIEWS_REPLY_15',
  REVIEWS_REPLY_50 = 'REVIEWS_REPLY_50',
  REVIEWS_REPLY_200 = 'REVIEWS_REPLY_200',
  CRM_LITE = 'CRM_LITE',
  CRM_PRO = 'CRM_PRO',
  ROI_FORECAST = 'ROI_FORECAST',
  
  // Plan/Optimize
  BOOST_ENGINE = 'BOOST_ENGINE',
  AB_TESTS = 'AB_TESTS',
  CAMPAIGN_COMPOSER_API = 'CAMPAIGN_COMPOSER_API',
  
  // Voice
  VOICE_QNA = 'VOICE_QNA',
  VOICE_PLANNER = 'VOICE_PLANNER',
  VOICE_STRATEGIST = 'VOICE_STRATEGIST',
  VOICE_CONCIERGE_ALL = 'VOICE_CONCIERGE_ALL',
  
  // Compliance
  COMPLIANCE_LITE = 'COMPLIANCE_LITE',
  COMPLIANCE_FULL = 'COMPLIANCE_FULL',
  COMPLIANCE_GOVERNED_AUTO = 'COMPLIANCE_GOVERNED_AUTO',
  
  // Prime autonomy
  SENTRY_MODE = 'SENTRY_MODE',
  POLICY_APPROVAL_ENGINE = 'POLICY_APPROVAL_ENGINE',
  MISSION_LOG_REALTIME = 'MISSION_LOG_REALTIME',
  DRY_RUN_SHADOW = 'DRY_RUN_SHADOW',
  COMPETITOR_INTELLIGENCE = 'COMPETITOR_INTELLIGENCE',
  EXPERIMENTATION_ENGINE = 'EXPERIMENTATION_ENGINE',
  ROUTER_ADVANCED_BUDGETS = 'ROUTER_ADVANCED_BUDGETS',
  RISK_CENTER = 'RISK_CENTER',
  AGENT_STORE_ALL_ACCESS = 'AGENT_STORE_ALL_ACCESS'
}

export interface FeatureConfig {
  enabled: boolean;
  limit?: number;
  quota?: {
    period: 'month' | 'week' | 'day';
    limit: number;
  };
}

export const PLAN_FEATURES: Record<PlanTier, Record<Feature, FeatureConfig>> = {
  [PlanTier.LITE]: {
    [Feature.PLATFORM_IG_FB_GBP]: { enabled: true },
    [Feature.PLATFORM_TIKTOK]: { enabled: true },
    [Feature.PLATFORM_LINKEDIN]: { enabled: false },
    [Feature.PLATFORM_YT_SHORTS]: { enabled: false },
    
    [Feature.SCHEDULER_LIMITED_25]: { enabled: true, quota: { period: 'month', limit: 25 } },
    [Feature.SCHEDULER_UNLIMITED]: { enabled: false },
    [Feature.CAPTION_VARIANTS_2]: { enabled: true },
    [Feature.CAPTION_VARIANTS_3]: { enabled: false },
    
    [Feature.TRENDTAP_TEASER]: { enabled: true },
    [Feature.TRENDTAP_STANDARD]: { enabled: false },
    [Feature.TRENDTAP_PRO]: { enabled: false },
    
    [Feature.LISTEN_DIGEST]: { enabled: true },
    [Feature.LISTEN_INBOX]: { enabled: false },
    [Feature.LISTEN_CLASSIFY]: { enabled: false },
    [Feature.LISTEN_FULL]: { enabled: false },
    
    [Feature.REVIEWS_REPLY_15]: { enabled: true, quota: { period: 'month', limit: 15 } },
    [Feature.REVIEWS_REPLY_50]: { enabled: false },
    [Feature.REVIEWS_REPLY_200]: { enabled: false },
    [Feature.CRM_LITE]: { enabled: false },
    [Feature.CRM_PRO]: { enabled: false },
    [Feature.ROI_FORECAST]: { enabled: false },
    
    [Feature.BOOST_ENGINE]: { enabled: false },
    [Feature.AB_TESTS]: { enabled: false },
    [Feature.CAMPAIGN_COMPOSER_API]: { enabled: false },
    
    [Feature.VOICE_QNA]: { enabled: true },
    [Feature.VOICE_PLANNER]: { enabled: false },
    [Feature.VOICE_STRATEGIST]: { enabled: false },
    [Feature.VOICE_CONCIERGE_ALL]: { enabled: false },
    
    [Feature.COMPLIANCE_LITE]: { enabled: true },
    [Feature.COMPLIANCE_FULL]: { enabled: false },
    [Feature.COMPLIANCE_GOVERNED_AUTO]: { enabled: false },
    
    [Feature.SENTRY_MODE]: { enabled: false },
    [Feature.POLICY_APPROVAL_ENGINE]: { enabled: false },
    [Feature.MISSION_LOG_REALTIME]: { enabled: false },
    [Feature.DRY_RUN_SHADOW]: { enabled: false },
    [Feature.COMPETITOR_INTELLIGENCE]: { enabled: false },
    [Feature.EXPERIMENTATION_ENGINE]: { enabled: false },
    [Feature.ROUTER_ADVANCED_BUDGETS]: { enabled: false },
    [Feature.RISK_CENTER]: { enabled: false },
    [Feature.AGENT_STORE_ALL_ACCESS]: { enabled: false }
  },
  
  [PlanTier.PLUS]: {
    [Feature.PLATFORM_IG_FB_GBP]: { enabled: true },
    [Feature.PLATFORM_TIKTOK]: { enabled: true },
    [Feature.PLATFORM_LINKEDIN]: { enabled: true },
    [Feature.PLATFORM_YT_SHORTS]: { enabled: true },
    
    [Feature.SCHEDULER_LIMITED_25]: { enabled: false },
    [Feature.SCHEDULER_UNLIMITED]: { enabled: true },
    [Feature.CAPTION_VARIANTS_2]: { enabled: false },
    [Feature.CAPTION_VARIANTS_3]: { enabled: true },
    
    [Feature.TRENDTAP_TEASER]: { enabled: false },
    [Feature.TRENDTAP_STANDARD]: { enabled: true },
    [Feature.TRENDTAP_PRO]: { enabled: false },
    
    [Feature.LISTEN_DIGEST]: { enabled: false },
    [Feature.LISTEN_INBOX]: { enabled: true },
    [Feature.LISTEN_CLASSIFY]: { enabled: true },
    [Feature.LISTEN_FULL]: { enabled: false },
    
    [Feature.REVIEWS_REPLY_15]: { enabled: false },
    [Feature.REVIEWS_REPLY_50]: { enabled: true, quota: { period: 'month', limit: 50 } },
    [Feature.REVIEWS_REPLY_200]: { enabled: false },
    [Feature.CRM_LITE]: { enabled: true },
    [Feature.CRM_PRO]: { enabled: false },
    [Feature.ROI_FORECAST]: { enabled: false },
    
    [Feature.BOOST_ENGINE]: { enabled: false },
    [Feature.AB_TESTS]: { enabled: false },
    [Feature.CAMPAIGN_COMPOSER_API]: { enabled: false },
    
    [Feature.VOICE_QNA]: { enabled: false },
    [Feature.VOICE_PLANNER]: { enabled: true },
    [Feature.VOICE_STRATEGIST]: { enabled: false },
    [Feature.VOICE_CONCIERGE_ALL]: { enabled: false },
    
    [Feature.COMPLIANCE_LITE]: { enabled: false },
    [Feature.COMPLIANCE_FULL]: { enabled: false },
    [Feature.COMPLIANCE_GOVERNED_AUTO]: { enabled: false },
    
    [Feature.SENTRY_MODE]: { enabled: false },
    [Feature.POLICY_APPROVAL_ENGINE]: { enabled: false },
    [Feature.MISSION_LOG_REALTIME]: { enabled: false },
    [Feature.DRY_RUN_SHADOW]: { enabled: false },
    [Feature.COMPETITOR_INTELLIGENCE]: { enabled: false },
    [Feature.EXPERIMENTATION_ENGINE]: { enabled: false },
    [Feature.ROUTER_ADVANCED_BUDGETS]: { enabled: false },
    [Feature.RISK_CENTER]: { enabled: false },
    [Feature.AGENT_STORE_ALL_ACCESS]: { enabled: false }
  },
  
  [PlanTier.PRO]: {
    [Feature.PLATFORM_IG_FB_GBP]: { enabled: true },
    [Feature.PLATFORM_TIKTOK]: { enabled: true },
    [Feature.PLATFORM_LINKEDIN]: { enabled: true },
    [Feature.PLATFORM_YT_SHORTS]: { enabled: true },
    
    [Feature.SCHEDULER_LIMITED_25]: { enabled: false },
    [Feature.SCHEDULER_UNLIMITED]: { enabled: true },
    [Feature.CAPTION_VARIANTS_2]: { enabled: false },
    [Feature.CAPTION_VARIANTS_3]: { enabled: true },
    
    [Feature.TRENDTAP_TEASER]: { enabled: false },
    [Feature.TRENDTAP_STANDARD]: { enabled: false },
    [Feature.TRENDTAP_PRO]: { enabled: true },
    
    [Feature.LISTEN_DIGEST]: { enabled: false },
    [Feature.LISTEN_INBOX]: { enabled: true },
    [Feature.LISTEN_CLASSIFY]: { enabled: true },
    [Feature.LISTEN_FULL]: { enabled: true },
    
    [Feature.REVIEWS_REPLY_15]: { enabled: false },
    [Feature.REVIEWS_REPLY_50]: { enabled: false },
    [Feature.REVIEWS_REPLY_200]: { enabled: true, quota: { period: 'month', limit: 200 } },
    [Feature.CRM_LITE]: { enabled: false },
    [Feature.CRM_PRO]: { enabled: true },
    [Feature.ROI_FORECAST]: { enabled: true },
    
    [Feature.BOOST_ENGINE]: { enabled: true },
    [Feature.AB_TESTS]: { enabled: true },
    [Feature.CAMPAIGN_COMPOSER_API]: { enabled: true },
    
    [Feature.VOICE_QNA]: { enabled: false },
    [Feature.VOICE_PLANNER]: { enabled: false },
    [Feature.VOICE_STRATEGIST]: { enabled: true },
    [Feature.VOICE_CONCIERGE_ALL]: { enabled: false },
    
    [Feature.COMPLIANCE_LITE]: { enabled: false },
    [Feature.COMPLIANCE_FULL]: { enabled: true },
    [Feature.COMPLIANCE_GOVERNED_AUTO]: { enabled: false },
    
    [Feature.SENTRY_MODE]: { enabled: false },
    [Feature.POLICY_APPROVAL_ENGINE]: { enabled: false },
    [Feature.MISSION_LOG_REALTIME]: { enabled: false },
    [Feature.DRY_RUN_SHADOW]: { enabled: false },
    [Feature.COMPETITOR_INTELLIGENCE]: { enabled: false },
    [Feature.EXPERIMENTATION_ENGINE]: { enabled: false },
    [Feature.ROUTER_ADVANCED_BUDGETS]: { enabled: false },
    [Feature.RISK_CENTER]: { enabled: false },
    [Feature.AGENT_STORE_ALL_ACCESS]: { enabled: false }
  },
  
  [PlanTier.PRIME]: {
    [Feature.PLATFORM_IG_FB_GBP]: { enabled: true },
    [Feature.PLATFORM_TIKTOK]: { enabled: true },
    [Feature.PLATFORM_LINKEDIN]: { enabled: true },
    [Feature.PLATFORM_YT_SHORTS]: { enabled: true },
    
    [Feature.SCHEDULER_LIMITED_25]: { enabled: false },
    [Feature.SCHEDULER_UNLIMITED]: { enabled: true },
    [Feature.CAPTION_VARIANTS_2]: { enabled: false },
    [Feature.CAPTION_VARIANTS_3]: { enabled: true },
    
    [Feature.TRENDTAP_TEASER]: { enabled: false },
    [Feature.TRENDTAP_STANDARD]: { enabled: false },
    [Feature.TRENDTAP_PRO]: { enabled: true },
    
    [Feature.LISTEN_DIGEST]: { enabled: false },
    [Feature.LISTEN_INBOX]: { enabled: true },
    [Feature.LISTEN_CLASSIFY]: { enabled: true },
    [Feature.LISTEN_FULL]: { enabled: true },
    
    [Feature.REVIEWS_REPLY_15]: { enabled: false },
    [Feature.REVIEWS_REPLY_50]: { enabled: false },
    [Feature.REVIEWS_REPLY_200]: { enabled: true, quota: { period: 'month', limit: 200 } },
    [Feature.CRM_LITE]: { enabled: false },
    [Feature.CRM_PRO]: { enabled: true },
    [Feature.ROI_FORECAST]: { enabled: true },
    
    [Feature.BOOST_ENGINE]: { enabled: true },
    [Feature.AB_TESTS]: { enabled: true },
    [Feature.CAMPAIGN_COMPOSER_API]: { enabled: true },
    
    [Feature.VOICE_QNA]: { enabled: false },
    [Feature.VOICE_PLANNER]: { enabled: false },
    [Feature.VOICE_STRATEGIST]: { enabled: false },
    [Feature.VOICE_CONCIERGE_ALL]: { enabled: true },
    
    [Feature.COMPLIANCE_LITE]: { enabled: false },
    [Feature.COMPLIANCE_FULL]: { enabled: false },
    [Feature.COMPLIANCE_GOVERNED_AUTO]: { enabled: true },
    
    [Feature.SENTRY_MODE]: { enabled: true },
    [Feature.POLICY_APPROVAL_ENGINE]: { enabled: true },
    [Feature.MISSION_LOG_REALTIME]: { enabled: true },
    [Feature.DRY_RUN_SHADOW]: { enabled: true },
    [Feature.COMPETITOR_INTELLIGENCE]: { enabled: true },
    [Feature.EXPERIMENTATION_ENGINE]: { enabled: true },
    [Feature.ROUTER_ADVANCED_BUDGETS]: { enabled: true },
    [Feature.RISK_CENTER]: { enabled: true },
    [Feature.AGENT_STORE_ALL_ACCESS]: { enabled: true }
  }
};
