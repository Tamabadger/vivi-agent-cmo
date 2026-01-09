import { db } from './index';
import { sql } from 'drizzle-orm';
import { LLMRouter } from '@vivi/router';

export interface EmbeddingDocument {
  id: string;
  orgId: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  type: 'content' | 'persona' | 'policy' | 'trend' | 'competitor';
  createdAt: Date;
}

export interface SimilaritySearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
  type: string;
}

export class VectorStore {
  private llmRouter: LLMRouter;

  constructor(llmRouter: LLMRouter) {
    this.llmRouter = llmRouter;
  }

  async initialize(): Promise<void> {
    try {
      // Enable pgvector extension if not already enabled
      await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);
      
      // Create vector tables if they don't exist
      await this.createVectorTables();
      
      console.log('✅ Vector store initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize vector store:', error);
      throw error;
    }
  }

  private async createVectorTables(): Promise<void> {
    // Create embeddings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS embeddings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1536),
        metadata JSONB,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes for similarity search
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_embeddings_org_type 
      ON embeddings(org_id, type)
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_embeddings_vector 
      ON embeddings USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `);

    // Create function for similarity search
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION similarity_search(
        query_embedding vector(1536),
        match_threshold float,
        match_count int,
        org_id_filter UUID,
        type_filter VARCHAR(50)
      )
      RETURNS TABLE (
        id UUID,
        content TEXT,
        similarity float,
        metadata JSONB,
        type VARCHAR(50)
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RETURN QUERY
        SELECT
          e.id,
          e.content,
          1 - (e.embedding <=> query_embedding) AS similarity,
          e.metadata,
          e.type
        FROM embeddings e
        WHERE e.org_id = org_id_filter
          AND e.type = type_filter
          AND 1 - (e.embedding <=> query_embedding) > match_threshold
        ORDER BY e.embedding <=> query_embedding
        LIMIT match_count;
      END;
      $$;
    `);
  }

  async storeEmbedding(document: Omit<EmbeddingDocument, 'id' | 'createdAt'>): Promise<string> {
    try {
      // Generate embedding using LLM router
      const embeddingResponse = await this.llmRouter.generateEmbeddings({
        input: document.content
      }, document.orgId);

      const embedding = embeddingResponse.data[0].embedding;

      // Store in database
      const result = await db.execute(sql`
        INSERT INTO embeddings (org_id, content, embedding, metadata, type)
        VALUES (${document.orgId}, ${document.content}, ${embedding}, ${JSON.stringify(document.metadata)}, ${document.type})
        RETURNING id
      `);

      const id = result[0]?.id as string;
      console.log(`✅ Stored embedding for document ${id}`);

      return id;
    } catch (error) {
      console.error('❌ Failed to store embedding:', error);
      throw error;
    }
  }

  async similaritySearch(
    query: string,
    orgId: string,
    type: string,
    threshold: number = 0.7,
    limit: number = 10
  ): Promise<SimilaritySearchResult[]> {
    try {
      // Generate embedding for query
      const embeddingResponse = await this.llmRouter.generateEmbeddings({
        input: query
      }, orgId);

      const queryEmbedding = embeddingResponse.data[0].embedding;

      // Perform similarity search
      const results = await db.execute(sql`
        SELECT * FROM similarity_search(
          ${queryEmbedding},
          ${threshold},
          ${limit},
          ${orgId},
          ${type}
        )
      `);

      return results.map(row => ({
        id: row.id as string,
        content: row.content as string,
        similarity: row.similarity as number,
        metadata: row.metadata as Record<string, any>,
        type: row.type as string
      }));
    } catch (error) {
      console.error('❌ Similarity search failed:', error);
      throw error;
    }
  }

  async findSimilarContent(
    content: string,
    orgId: string,
    type: string,
    threshold: number = 0.8,
    limit: number = 5
  ): Promise<SimilaritySearchResult[]> {
    return this.similaritySearch(content, orgId, type, threshold, limit);
  }

  async findRelevantPersonas(
    query: string,
    orgId: string,
    threshold: number = 0.7
  ): Promise<SimilaritySearchResult[]> {
    return this.similaritySearch(query, orgId, 'persona', threshold, 3);
  }

  async findRelevantPolicies(
    query: string,
    orgId: string,
    threshold: number = 0.7
  ): Promise<SimilaritySearchResult[]> {
    return this.similaritySearch(query, orgId, 'policy', threshold, 5);
  }

  async findTrendingTopics(
    query: string,
    orgId: string,
    threshold: number = 0.6
  ): Promise<SimilaritySearchResult[]> {
    return this.similaritySearch(query, orgId, 'trend', threshold, 10);
  }

  async findCompetitorInsights(
    query: string,
    orgId: string,
    threshold: number = 0.7
  ): Promise<SimilaritySearchResult[]> {
    return this.similaritySearch(query, orgId, 'competitor', threshold, 5);
  }

  async updateEmbedding(
    id: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Get the document to regenerate embedding
      const [doc] = await db.execute(sql`
        SELECT org_id, type FROM embeddings WHERE id = ${id}
      `);

      if (!doc) {
        throw new Error('Document not found');
      }

      // Generate new embedding
      const embeddingResponse = await this.llmRouter.generateEmbeddings({
        input: content
      }, doc.org_id as string);

      const embedding = embeddingResponse.data[0].embedding;

      // Update in database
      await db.execute(sql`
        UPDATE embeddings 
        SET content = ${content}, 
            embedding = ${embedding}, 
            metadata = ${JSON.stringify(metadata || {})},
            updated_at = NOW()
        WHERE id = ${id}
      `);

      console.log(`✅ Updated embedding for document ${id}`);
    } catch (error) {
      console.error('❌ Failed to update embedding:', error);
      throw error;
    }
  }

  async deleteEmbedding(id: string): Promise<void> {
    try {
      await db.execute(sql`DELETE FROM embeddings WHERE id = ${id}`);
      console.log(`✅ Deleted embedding ${id}`);
    } catch (error) {
      console.error('❌ Failed to delete embedding:', error);
      throw error;
    }
  }

  async getEmbeddingStats(orgId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    totalTokens: number;
    estimatedCost: number;
  }> {
    try {
      const stats = await db.execute(sql`
        SELECT 
          COUNT(*) as total,
          type,
          SUM(jsonb_array_length(metadata->'tokens')::int) as total_tokens
        FROM embeddings 
        WHERE org_id = ${orgId}
        GROUP BY type
      `);

      const byType: Record<string, number> = {};
      let totalTokens = 0;

      stats.forEach(row => {
        const type = row.type as string;
        const total = parseInt(row.total as string);
        const tokens = parseInt((row.total_tokens as string) || '0');
        
        byType[type] = total;
        totalTokens += tokens;
      });

      // Estimate cost (rough calculation)
      const estimatedCost = (totalTokens / 1000) * 0.00002; // $0.00002 per 1K tokens

      return {
        total: stats.reduce((sum, row) => sum + parseInt(row.total as string), 0),
        byType,
        totalTokens,
        estimatedCost
      };
    } catch (error) {
      console.error('❌ Failed to get embedding stats:', error);
      throw error;
    }
  }

  async cleanupOldEmbeddings(orgId: string, daysOld: number = 90): Promise<number> {
    try {
      const result = await db.execute(sql`
        DELETE FROM embeddings 
        WHERE org_id = ${orgId} 
          AND created_at < NOW() - INTERVAL '${daysOld} days'
      `);

      const deletedCount = result.length;
      console.log(`✅ Cleaned up ${deletedCount} old embeddings for org ${orgId}`);

      return deletedCount;
    } catch (error) {
      console.error('❌ Failed to cleanup old embeddings:', error);
      throw error;
    }
  }
}
