export interface AudioTranscription {
  text: string;
  language: string;
  confidence: number;
  segments: TranscriptionSegment[];
  duration: number;
  wordCount: number;
  sentiment?: SentimentAnalysis;
  keywords: string[];
  timestamp: Date;
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  confidence: number;
  speaker?: string;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: EmotionScore[];
  topics: TopicScore[];
}

export interface EmotionScore {
  emotion: string;
  score: number;
}

export interface TopicScore {
  topic: string;
  score: number;
}

export interface TextToSpeech {
  text: string;
  voice: string;
  speed: number;
  pitch: number;
  format: AudioFormat;
}

export type AudioFormat = 'mp3' | 'wav' | 'flac' | 'aac';

export interface VoiceCommand {
  audio: Buffer;
  language?: string;
  context?: string;
  maxTokens?: number;
}

export interface VoiceCommandResponse {
  command: string;
  intent: string;
  confidence: number;
  entities: Entity[];
  response: string;
  audioUrl?: string;
}

export interface Entity {
  type: string;
  value: string;
  confidence: number;
}

export interface AudioAnalysis {
  duration: number;
  format: string;
  sampleRate: number;
  channels: number;
  bitrate: number;
  quality: AudioQuality;
  transcription?: AudioTranscription;
}

export type AudioQuality = 'low' | 'medium' | 'high';

export interface VoiceProcessingOptions {
  language?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  includeConfidence?: boolean;
  includeSegments?: boolean;
  includeSentiment?: boolean;
  includeKeywords?: boolean;
}
