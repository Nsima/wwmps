-- Table: embeddings_metadata
CREATE TABLE IF NOT EXISTS embeddings_metadata (
    chunk_id TEXT PRIMARY KEY,
    title TEXT,
    source_url TEXT,
    transcription_date TIMESTAMP,
    word_count INTEGER,
    char_count INTEGER
);

-- Table: user_queries
CREATE TABLE IF NOT EXISTS user_queries (
    id SERIAL PRIMARY KEY,
    user_id TEXT,  
    question TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: chat_responses
CREATE TABLE IF NOT EXISTS chat_responses (
    id SERIAL PRIMARY KEY,
    query_id INTEGER NOT NULL,
    response TEXT NOT NULL,
    retrieved_chunk_ids TEXT[],  -- FAISS chunk_ids retrieved for this answer
    model_version TEXT DEFAULT 'gpt-4-turbo',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_query
        FOREIGN KEY(query_id)
        REFERENCES user_queries(id)
        ON DELETE CASCADE
);

-- Table: user_feedback
CREATE TABLE IF NOT EXISTS user_feedback (
    id SERIAL PRIMARY KEY,
    response_id INTEGER NOT NULL,
    rating TEXT CHECK (rating IN ('up', 'down', 'neutral')),
    comment TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_response
        FOREIGN KEY(response_id)
        REFERENCES chat_responses(id)
        ON DELETE CASCADE
);
