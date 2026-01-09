export interface ModelConfig {
  provider: string;
  model: string;
  maxTokens: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  latencyMs: number;
  quality: 'low' | 'medium' | 'high';
  capabilities: string[];
}

export interface RoutingConstraints {
  maxCost: number;
  maxLatency: number;
  requiredQuality: 'low' | 'medium' | 'high';
  requiredCapabilities: string[];
  task: string;
  locale: string;
}

export interface ModelResponse {
  provider: string;
  model: string;
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
  };
  latency: number;
  metadata: Record<string, any>;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
}

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
    object: string;
  }>;
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface CostTracking {
  orgId: string;
  provider: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  timestamp: Date;
  task: string;
  userId?: string;
}
