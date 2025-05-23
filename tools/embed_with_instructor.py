import json
import os
import faiss
import numpy as np
import psycopg2
from InstructorEmbedding import INSTRUCTOR

# === Extract pastor name from title ===
def extract_pastor_name(title: str) -> str:
    title = title.lower()
    if "oyedepo" in title:
        return "Bishop David Oyedepo"
    elif "adeboye" in title:
        return "Pastor Enoch Adeboye"
    elif "adefarasin" in title:
        return "Pastor Paul Adefarasin"
    elif "ibiyeomie" in title:
        return "Pastor David Ibiyeomie"
    else:
        return "Unknown"

# === Load model (CPU-optimized version) ===
model = INSTRUCTOR('hkunlp/instructor-base')

# === Helper to batch embedding ===
def batch_embed(texts, batch_size=8):
    results = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        embeddings = model.encode([["Represent the meaning of this sentence for semantic search", t] for t in batch])
        results.extend(embeddings)
    return np.array(results).astype("float32")

# === Load JSONL ===
input_file = "tools/ready_for_embedding.jsonl"
with open(input_file, "r", encoding="utf-8") as f:
    chunks = [json.loads(line) for line in f]

# === Connect to Postgres ===
conn = psycopg2.connect(
    dbname="Chatbot",
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
    pastor_name TEXT,
    source_url TEXT,
    transcription_date TIMESTAMP,
    word_count INT,
    char_count INT
);
""")

# === Save chunks and prepare for embedding ===
texts = []
meta_ids = []

for item in chunks:
    pastor_name = extract_pastor_name(item["title"])

    cur.execute("""
        INSERT INTO sermon_chunks (
            chunk_id, chunk, title, pastor_name, source_url,
            transcription_date, word_count, char_count
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (chunk_id) DO NOTHING;
    """, (
        item["chunk_id"], item["chunk"], item["title"], pastor_name,
        item["source_url"], item["transcription_date"],
        item["word_count"], item["char_count"]
    ))

    texts.append(item["chunk"])
    meta_ids.append(item["chunk_id"])

conn.commit()

# === Generate Embeddings (CPU-safe batch processing) ===
embeddings = batch_embed(texts)

# === Save FAISS index ===
dim = embeddings.shape[1]
index = faiss.IndexFlatL2(dim)
index.add(embeddings)
faiss.write_index(index, "tools/sermons.faiss")

# === Save ID Mapping ===
with open("tools/id_mapping.json", "w") as f:
    json.dump(meta_ids, f)

print("✅ Embeddings generated with instructor-base and stored in FAISS. Metadata saved to Postgres.")