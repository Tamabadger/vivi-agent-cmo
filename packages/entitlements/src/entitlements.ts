import { PlanTier } from '@vivi/common';
import { Feature, FeatureConfig, PLAN_FEATURES } from './features';

export class EntitlementsService {
  /**
   * Check if a feature is enabled for a given plan tier
   */
  static hasFeatureForPlan(plan: PlanTier, feature: Feature): boolean {
    const planFeatures = PLAN_FEATURES[plan];
    if (!planFeatures) {
      return false;
    }
    
    const featureConfig = planFeatures[feature];
    return featureConfig?.enabled || false;
  }

  /**
   * Get the limit for a feature on a given plan tier
   */
  static limitFor(plan: PlanTier, feature: Feature): number | undefined {
    const planFeatures = PLAN_FEATURES[plan];
    if (!planFeatures) {
      return undefined;
    }
    
    const featureConfig = planFeatures[feature];
    return featureConfig?.limit;
  }

  /**
   * Get quota information for a feature on a given plan tier
   */
  static quotaFor(plan: PlanTier, feature: Feature): { period: 'month' | 'week' | 'day'; limit: number } | undefined {
    const planFeatures = PLAN_FEATURES[plan];
    if (!planFeatures) {
      return undefined;
    }
    
    const featureConfig = planFeatures[feature];
    return featureConfig?.quota;
  }

  /**
   * Get all enabled features for a plan tier
   */
  static getEnabledFeatures(plan: PlanTier): Feature[] {
    const planFeatures = PLAN_FEATURES[plan];
    if (!planFeatures) {
      return [];
    }
    
    return Object.entries(planFeatures)
      .filter(([_, config]) => config.enabled)
      .map(([feature]) => feature as Feature);
  }

  /**
   * Get all features with their configuration for a plan tier
   */
  static getPlanFeatures(plan: PlanTier): Record<Feature, FeatureConfig> {
    return PLAN_FEATURES[plan] || {};
  }

  /**
   * Check if a plan tier supports a specific platform
   */
  static supportsPlatform(plan: PlanTier, platform: string): boolean {
    const platformFeatures = [
      Feature.PLATFORM_IG_FB_GBP,
      Feature.PLATFORM_TIKTOK,
      Feature.PLATFORM_LINKEDIN,
      Feature.PLATFORM_YT_SHORTS
    ];
    
    const platformFeature = platformFeatures.find(f => 
      f.toLowerCase().includes(platform.toLowerCase())
    );
    
    if (!platformFeature) {
      return false;
    }
    
    return this.hasFeatureForPlan(plan, platformFeature);
  }

  /**
   * Get the maximum number of caption variants for a plan tier
   */
  static getCaptionVariants(plan: PlanTier): number {
    if (this.hasFeatureForPlan(plan, Feature.CAPTION_VARIANTS_3)) {
      return 3;
    }
    if (this.hasFeatureForPlan(plan, Feature.CAPTION_VARIANTS_2)) {
      return 2;
    }
    return 1;
  }

  /**
   * Get the scheduler limit for a plan tier
   */
  static getSchedulerLimit(plan: PlanTier): number | null {
    if (this.hasFeatureForPlan(plan, Feature.SCHEDULER_UNLIMITED)) {
      return null; // unlimited
    }
    if (this.hasFeatureForPlan(plan, Feature.SCHEDULER_LIMITED_25)) {
      return 25;
    }
    return 0;
  }

  /**
   * Check if a plan tier has unlimited scheduling
   */
  static hasUnlimitedScheduling(plan: PlanTier): boolean {
    return this.hasFeatureForPlan(plan, Feature.SCHEDULER_UNLIMITED);
  }

  /**
   * Get the review reply limit for a plan tier
   */
  static getReviewReplyLimit(plan: PlanTier): number {
    if (this.hasFeatureForPlan(plan, Feature.REVIEWS_REPLY_200)) {
      return 200;
    }
    if (this.hasFeatureForPlan(plan, Feature.REVIEWS_REPLY_50)) {
      return 50;
    }
    if (this.hasFeatureForPlan(plan, Feature.REVIEWS_REPLY_15)) {
      return 15;
    }
    return 0;
  }

  /**
   * Check if a plan tier has access to advanced features
   */
  static hasAdvancedFeatures(plan: PlanTier): boolean {
    return plan === PlanTier.PRO || plan === PlanTier.PRIME;
  }

  /**
   * Check if a plan tier has Prime features
   */
  static hasPrimeFeatures(plan: PlanTier): boolean {
    return plan === PlanTier.PRIME;
  }

  /**
   * Get upgrade suggestions for a plan tier
   */
  static getUpgradeSuggestions(plan: PlanTier): string[] {
    const suggestions: string[] = [];
    
    switch (plan) {
      case PlanTier.LITE:
        suggestions.push('Upgrade to PLUS for LinkedIn & YouTube Shorts support');
        suggestions.push('Upgrade to PLUS for unlimited scheduling');
        suggestions.push('Upgrade to PLUS for 3 caption variants');
        suggestions.push('Upgrade to PLUS for CRM Lite features');
        break;
      case PlanTier.PLUS:
        suggestions.push('Upgrade to PRO for Boost Engine & AB Testing');
        suggestions.push('Upgrade to PRO for ROI forecasting');
        suggestions.push('Upgrade to PRO for full compliance features');
        break;
      case PlanTier.PRO:
        suggestions.push('Upgrade to PRIME for Sentry Mode & autonomous operations');
        suggestions.push('Upgrade to PRIME for competitor intelligence');
        suggestions.push('Upgrade to PRIME for advanced governance');
        break;
    }
    
    return suggestions;
  }
}
