import OpenAI from 'openai';
import { z } from 'zod';
import { 
  ModelConfig, 
  RoutingConstraints, 
  ModelResponse, 
  ChatRequest, 
  ChatMessage,
  EmbeddingRequest,
  EmbeddingResponse,
  CostTracking
} from './types';

export class LLMRouter {
  private openai: OpenAI;
  private models: Map<string, ModelConfig>;

  constructor(openaiApiKey: string) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.models = this.initializeModels();
  }

  private initializeModels(): Map<string, ModelConfig> {
    const models = new Map<string, ModelConfig>();
    
    // OpenAI Models
    models.set('gpt-4o', {
      provider: 'openai',
      model: 'gpt-4o',
      maxTokens: 128000,
      costPer1kInput: 0.005,
      costPer1kOutput: 0.015,
      latencyMs: 2000,
      quality: 'high',
      capabilities: ['reasoning', 'creativity', 'analysis', 'multimodal']
    });

    models.set('gpt-4o-mini', {
      provider: 'openai',
      model: 'gpt-4o-mini',
      maxTokens: 128000,
      costPer1kInput: 0.00015,
      costPer1kOutput: 0.0006,
      latencyMs: 1000,
      quality: 'medium',
      capabilities: ['reasoning', 'creativity', 'analysis']
    });

    models.set('gpt-3.5-turbo', {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      maxTokens: 16385,
      costPer1kInput: 0.0005,
      costPer1kOutput: 0.0015,
      latencyMs: 500,
      quality: 'low',
      capabilities: ['basic_reasoning', 'creativity']
    });

    // Embedding Models
    models.set('text-embedding-3-small', {
      provider: 'openai',
      model: 'text-embedding-3-small',
      maxTokens: 8192,
      costPer1kInput: 0.00002,
      costPer1kOutput: 0,
      latencyMs: 200,
      quality: 'medium',
      capabilities: ['embeddings']
    });

    return models;
  }

  async routeRequest(constraints: RoutingConstraints): Promise<ModelConfig> {
    const availableModels = Array.from(this.models.values())
      .filter(model => {
        // Filter by quality
        if (constraints.requiredQuality === 'high' && model.quality !== 'high') return false;
        if (constraints.requiredQuality === 'medium' && model.quality === 'low') return false;
        
        // Filter by capabilities
        const hasCapabilities = constraints.requiredCapabilities.every(cap => 
          model.capabilities.includes(cap)
        );
        if (!hasCapabilities) return false;
        
        // Filter by budget (using maxCost from constraints)
        if (constraints.maxCost && (model.costPer1kInput + model.costPer1kOutput) > constraints.maxCost) return false;
        
        return true;
      });

    if (availableModels.length === 0) {
      throw new Error('No models available for the given constraints');
    }

    // Sort by cost efficiency (lower cost first)
    availableModels.sort((a, b) => {
      const aCost = a.costPer1kInput + a.costPer1kOutput;
      const bCost = b.costPer1kInput + b.costPer1kOutput;
      return aCost - bCost;
    });

    return availableModels[0];
  }

  async chatCompletion(request: ChatRequest, orgId: string, userId?: string): Promise<ModelResponse> {
    const startTime = Date.now();
    
    // Route to appropriate model
    const selectedModel = await this.routeRequest({
      requiredQuality: 'medium',
      requiredCapabilities: ['basic_reasoning'],
      maxCost: 0.10, // $0.10 max cost
      maxLatency: 5000, // 5 seconds max
      task: 'chat',
      locale: 'en'
    });

    try {
      const completion = await this.openai.chat.completions.create({
        model: selectedModel.model,
        messages: request.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: Math.min(request.maxTokens || 1000, selectedModel.maxTokens),
        temperature: request.temperature || 0.7,
        top_p: request.topP || 1,
        stream: false // Disable streaming for now to avoid complexity
      });

      const endTime = Date.now();
      const latency = endTime - startTime;

      // Extract usage and calculate cost
      const usage = completion.usage;
      if (!usage) {
        throw new Error('No usage data received from OpenAI');
      }
      
      const cost = this.calculateCost(
        usage.prompt_tokens,
        usage.completion_tokens,
        selectedModel
      );

      // Track cost (simplified - just log for now)
      console.log(`Cost tracked for org ${orgId}: $${cost.toFixed(6)}`);

      return {
        provider: selectedModel.provider,
        model: selectedModel.model,
        content: completion.choices[0].message.content || '',
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          cost
        },
        latency,
        metadata: {
          finishReason: completion.choices[0].finish_reason,
          model: selectedModel.model
        }
      };

    } catch (error) {
      // Log error
      console.error('Chat completion failed:', error);
      throw error;
    }
  }

  async generateEmbeddings(request: EmbeddingRequest, orgId: string): Promise<EmbeddingResponse> {
    const startTime = Date.now();
    
    const embeddingModel = this.models.get('text-embedding-3-small');
    if (!embeddingModel) {
      throw new Error('Embedding model not available');
    }

    try {
      const embeddings = await this.openai.embeddings.create({
        model: embeddingModel.model,
        input: request.input
      });

      const endTime = Date.now();
      const latency = endTime - startTime;

      // Calculate cost
      const cost = this.calculateCost(
        embeddings.usage.prompt_tokens,
        0, // No output tokens for embeddings
        embeddingModel
      );

      // Track cost (simplified - just log for now)
      console.log(`Embedding cost tracked for org ${orgId}: $${cost.toFixed(6)}`);

      return {
        data: embeddings.data.map(item => ({
          embedding: item.embedding,
          index: item.index,
          object: item.object
        })),
        model: embeddingModel.model,
        usage: {
          promptTokens: embeddings.usage.prompt_tokens,
          totalTokens: embeddings.usage.total_tokens
        }
      };

    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw error;
    }
  }

  private calculateCost(inputTokens: number, outputTokens: number, model: ModelConfig): number {
    const inputCost = (inputTokens / 1000) * model.costPer1kInput;
    const outputCost = (outputTokens / 1000) * model.costPer1kOutput;
    return inputCost + outputCost;
  }

  async getCostSummary(orgId: string, month?: string): Promise<{
    totalCost: number;
    totalTokens: number;
    requests: number;
    breakdown: Record<string, number>;
  }> {
    // Simplified cost summary - return placeholder data
    console.log(`Cost summary requested for org ${orgId}, month: ${month || 'current'}`);
    
    return {
      totalCost: 0,
      totalTokens: 0,
      requests: 0,
      breakdown: {}
    };
  }

  async close(): Promise<void> {
    // No cleanup needed for simplified version
  }
}
