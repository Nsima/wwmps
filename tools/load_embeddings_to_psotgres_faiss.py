import json
import os
import psycopg2
import faiss
import numpy as np
from openai import OpenAIEmbeddings  # Or use your local embedding tool
# === Load JSONL ===
with open("tools/ready_for_embedding.jsonl", "r", encoding="utf-8") as f:
    chunks = [json.loads(line) for line in f]

# === Connect to Postgres ===
conn = psycopg2.connect(
    dbname="postgres",
    user="postgres",
    password="password",
    host="localhost",
    port=5432
)

cur = conn.cursor()

# === Create table if not exists ===
cur.execute("""
CREATE TABLE IF NOT EXISTS sermon_chunks (
    id SERIAL PRIMARY KEY,
    chunk_id TEXT UNIQUE,
    chunk TEXT,
    title TEXT,
    source_url TEXT,
    transcription_date TIMESTAMP,
    word_count INT,
    char_count INT
);
""")

# === Save chunks and collect text for embedding ===
texts = []
meta_ids = []
for item in chunks:
    cur.execute("""
        INSERT INTO sermon_chunks (chunk_id, chunk, title, source_url, transcription_date, word_count, char_count)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (chunk_id) DO NOTHING;
    """, (
        item["chunk_id"], item["chunk"], item["title"],
        item["source_url"], item["transcription_date"],
        item["word_count"], item["char_count"]
    ))
    texts.append(item["chunk"])
    meta_ids.append(item["chunk_id"])

conn.commit()

# === Generate Embeddings ===
embedder = OpenAIEmbeddings(model="text-embedding-ada-002")  # or local embedding model
vectors = embedder.embed_documents(texts)  # shape (n, 1536)

# === Build and save FAISS index ===
dim = len(vectors[0])
index = faiss.IndexFlatL2(dim)
index.add(np.array(vectors).astype("float32"))

faiss.write_index(index, "tools/sermons.faiss")

# === Save mapping for retrieval ===
with open("tools/id_mapping.json", "w") as f:
    json.dump(meta_ids, f)

print("✅ Embeddings loaded to FAISS and metadata saved in Postgres.")
