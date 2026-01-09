export enum PlanTier {
  LITE = 'LITE',
  PLUS = 'PLUS',
  PRO = 'PRO',
  PRIME = 'PRIME'
}

export enum Platform {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  GOOGLE_BUSINESS = 'google_business',
  TIKTOK = 'tiktok',
  LINKEDIN = 'linkedin',
  YOUTUBE_SHORTS = 'youtube_shorts'
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio'
}

export enum ContentStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed'
}

export enum Intent {
  ENGAGEMENT = 'engagement',
  SALES = 'sales',
  AWARENESS = 'awareness',
  SUPPORT = 'support',
  SPAM = 'spam'
}

export enum Sentiment {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative'
}

export enum BoostLevel {
  NONE = 0,
  BOOST_1X = 1,
  BOOST_2X = 2,
  BOOST_3X = 3
}

export interface Organization {
  id: string;
  name: string;
  planTier: PlanTier;
  timezone: string;
  onboardingComplete: boolean;
  createdAt: Date;
}

export interface User {
  id: string;
  orgId: string;
  email: string;
  role: string;
  auth0Id: string;
  createdAt: Date;
}

export interface MediaAsset {
  id: string;
  orgId: string;
  type: MediaType;
  uri: string;
  metadata: Record<string, any>;
  analysisJson: Record<string, any>;
  derivatives: Record<string, string>;
  language: string;
}

export interface CaptionSuggestion {
  id: string;
  orgId: string;
  assetId: string;
  platform: Platform;
  variantIdx: number;
  caption: string;
  hashtags: string[];
  complianceNotes: Record<string, any>;
  createdAt: Date;
}

export interface ScheduledPost {
  id: string;
  orgId: string;
  platform: Platform;
  assetId: string;
  caption: string;
  scheduledFor: Date;
  boostLevel: BoostLevel;
  status: ContentStatus;
}

export interface Mention {
  id: string;
  orgId: string;
  provider: Platform;
  remoteId: string;
  text: string;
  author: string;
  ts: Date;
}

export interface Classification {
  id: string;
  orgId: string;
  subjectType: string;
  subjectId: string;
  intent: Intent;
  sentiment: Sentiment;
  topic: string;
  lang: string;
  score: number;
}

export interface Mission {
  id: string;
  orgId: string;
  type: string;
  status: string;
  startedAt: Date;
  finishedAt?: Date;
  score?: number;
  dryRun: boolean;
}

export interface MissionStep {
  id: string;
  missionId: string;
  stepNo: number;
  kind: string;
  payload: Record<string, any>;
  status: string;
  startedAt: Date;
  finishedAt?: Date;
  costCents?: number;
  modelUsed?: string;
}
