BEGIN;

-- 0) Keep your original table for reference (no drop). Create the new canonical table used by your loader/search.
CREATE TABLE IF NOT EXISTS sermon_chunks (
  id SERIAL PRIMARY KEY,
  chunk_id TEXT UNIQUE,
  chunk TEXT,
  title TEXT,
  source_url TEXT,
  transcription_date TIMESTAMP,
  word_count INT,
  char_count INT,
  pastor_slug TEXT
);

-- Optional one-time backfill from old embeddings_metadata (no chunk text available there).
INSERT INTO sermon_chunks (chunk_id, title, source_url, transcription_date, word_count, char_count)
SELECT em.chunk_id, em.title, em.source_url, em.transcription_date, em.word_count, em.char_count
FROM embeddings_metadata em
LEFT JOIN sermon_chunks sc ON sc.chunk_id = em.chunk_id
WHERE sc.chunk_id IS NULL;

-- 1) user_queries: add columns for telemetry and retrieval summary
ALTER TABLE user_queries ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE user_queries ADD COLUMN IF NOT EXISTS conversation_id TEXT;
ALTER TABLE user_queries ADD COLUMN IF NOT EXISTS pastor_slug TEXT;
ALTER TABLE user_queries ADD COLUMN IF NOT EXISTS top_k INT DEFAULT 6;
ALTER TABLE user_queries ADD COLUMN IF NOT EXISTS embed_model TEXT;
ALTER TABLE user_queries ADD COLUMN IF NOT EXISTS faiss_metric TEXT;
ALTER TABLE user_queries ADD COLUMN IF NOT EXISTS retrieval JSONB DEFAULT '{}'::jsonb;
ALTER TABLE user_queries ADD COLUMN IF NOT EXISTS search_latency_ms INT;
ALTER TABLE user_queries ADD COLUMN IF NOT EXISTS client_ip TEXT;
ALTER TABLE user_queries ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Rename legacy "timestamp" -> "created_at" and make it timestamptz
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name='user_queries' AND column_name='timestamp'
  ) THEN
    ALTER TABLE user_queries RENAME COLUMN "timestamp" TO created_at;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name='user_queries' AND column_name='created_at'
  ) THEN
    ALTER TABLE user_queries ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Ensure timestamptz
  ALTER TABLE user_queries
    ALTER COLUMN created_at TYPE TIMESTAMPTZ
    USING CASE
            WHEN pg_typeof(created_at)::text = 'timestamp without time zone'
            THEN created_at AT TIME ZONE 'UTC'
            ELSE created_at
         END;
END $$;

-- 2) chat_responses: rename + extend to capture citations and Ollama metrics
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name='chat_responses' AND column_name='query_id'
  ) THEN
    ALTER TABLE chat_responses RENAME COLUMN query_id TO user_query_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name='chat_responses' AND column_name='response'
  ) THEN
    ALTER TABLE chat_responses RENAME COLUMN response TO answer;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name='chat_responses' AND column_name='model_version'
  ) THEN
    ALTER TABLE chat_responses RENAME COLUMN model_version TO model;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name='chat_responses' AND column_name='timestamp'
  ) THEN
    ALTER TABLE chat_responses RENAME COLUMN "timestamp" TO created_at;
  END IF;

  -- Ensure created_at exists and is timestamptz
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name='chat_responses' AND column_name='created_at'
  ) THEN
    ALTER TABLE chat_responses ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  ALTER TABLE chat_responses
    ALTER COLUMN created_at TYPE TIMESTAMPTZ
    USING CASE
            WHEN pg_typeof(created_at)::text = 'timestamp without time zone'
            THEN created_at AT TIME ZONE 'UTC'
            ELSE created_at
         END;
END $$;

-- New columns (idempotent)
ALTER TABLE chat_responses ADD COLUMN IF NOT EXISTS ok BOOLEAN DEFAULT TRUE;
ALTER TABLE chat_responses ADD COLUMN IF NOT EXISTS temperature REAL;
ALTER TABLE chat_responses ADD COLUMN IF NOT EXISTS num_ctx INT;
ALTER TABLE chat_responses ADD COLUMN IF NOT EXISTS citations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE chat_responses ADD COLUMN IF NOT EXISTS raw_completion JSONB;
ALTER TABLE chat_responses ADD COLUMN IF NOT EXISTS eval_count INT;
ALTER TABLE chat_responses ADD COLUMN IF NOT EXISTS prompt_eval_count INT;
ALTER TABLE chat_responses ADD COLUMN IF NOT EXISTS total_duration_ms BIGINT;
ALTER TABLE chat_responses ADD COLUMN IF NOT EXISTS load_duration_ms BIGINT;
ALTER TABLE chat_responses ADD COLUMN IF NOT EXISTS prompt_eval_ms BIGINT;
ALTER TABLE chat_responses ADD COLUMN IF NOT EXISTS eval_ms BIGINT;
ALTER TABLE chat_responses ADD COLUMN IF NOT EXISTS gen_latency_ms INT;

-- Backfill citations from legacy retrieved_chunk_ids (if any)
UPDATE chat_responses cr
SET citations = sub.cits
FROM (
  SELECT id,
         COALESCE(
           (SELECT jsonb_agg(jsonb_build_object('chunk_id', cid))
              FROM unnest(retrieved_chunk_ids) AS cid),
           '[]'::jsonb
         ) AS cits
  FROM chat_responses
) AS sub
WHERE cr.id = sub.id
  AND (cr.citations IS NULL OR cr.citations = '[]'::jsonb)
  AND EXISTS (SELECT 1 FROM unnest(cr.retrieved_chunk_ids) AS _u);

-- 3) user_feedback: rename timestamp -> created_at (timestamptz)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name='user_feedback' AND column_name='timestamp'
  ) THEN
    ALTER TABLE user_feedback RENAME COLUMN "timestamp" TO created_at;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name='user_feedback' AND column_name='created_at'
  ) THEN
    ALTER TABLE user_feedback ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  ALTER TABLE user_feedback
    ALTER COLUMN created_at TYPE TIMESTAMPTZ
    USING CASE
            WHEN pg_typeof(created_at)::text = 'timestamp without time zone'
            THEN created_at AT TIME ZONE 'UTC'
            ELSE created_at
         END;
END $$;

-- 4) Constraints & Indexes
-- Ensure FK still points to user_queries after column rename (Postgres updates it automatically on rename).
-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_queries_created ON user_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_queries_pastor  ON user_queries(pastor_slug);
CREATE INDEX IF NOT EXISTS idx_chat_responses_query ON chat_responses(user_query_id);

COMMIT;
