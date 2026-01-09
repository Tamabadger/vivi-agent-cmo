-- ViVi CMO Agent Database Initialization
-- This script runs when the PostgreSQL container starts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create custom types/enums
DO $$ BEGIN
    CREATE TYPE plan_tier AS ENUM ('LITE', 'PLUS', 'PRO', 'PRIME');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE platform AS ENUM ('instagram', 'facebook', 'google_business', 'tiktok', 'linkedin', 'youtube_shorts');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE media_type AS ENUM ('image', 'video', 'audio');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('draft', 'scheduled', 'published', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE intent AS ENUM ('engagement', 'sales', 'awareness', 'support', 'spam');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sentiment AS ENUM ('positive', 'neutral', 'negative');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE boost_level AS ENUM ('0', '1', '2', '3');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create embeddings table for vector storage
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for org_id lookups
CREATE INDEX IF NOT EXISTS embeddings_org_id_idx ON embeddings(org_id);
CREATE INDEX IF NOT EXISTS embeddings_type_idx ON embeddings(type);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vivi;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vivi;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'ViVi CMO Agent database initialized successfully';
END $$;
