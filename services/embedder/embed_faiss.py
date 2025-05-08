import os
import certifi
import argparse
import json
import faiss
import numpy as np
from tqdm import tqdm
from openai import OpenAI, RateLimitError, APIStatusError
from config import OPENAI_API_KEY
from db import insert_metadata

# 🔒 Fix SSL issues
os.environ["SSL_CERT_FILE"] = certifi.where()

# 🔑 Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

def embed_text(text):
    try:
        response = client.embeddings.create(
            input=[text],
            model="text-embedding-ada-002"
        )
        return response.data[0].embedding
    except RateLimitError:
        print("❌ Rate limit exceeded — you may be out of quota.")
        return None
    except APIStatusError as e:
        print(f"❌ OpenAI API error: {e}")
        return None

def main(jsonl_path, index_output_name):
    index = faiss.IndexFlatL2(1536)
    skipped_chunks = 0

    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in tqdm(f, desc=f"Embedding: {jsonl_path}"):
            item = json.loads(line)
            chunk = item["chunk"]
            chunk_id = item["chunk_id"]

            # Get embedding
            embedding = embed_text(chunk)
            if embedding is None:
                skipped_chunks += 1
                continue

            vector = np.array(embedding, dtype="float32")
            index.add(np.expand_dims(vector, axis=0))

            insert_metadata(
                chunk_id,
                item["title"],
                item.get("source_url"),
                item["transcription_date"],
                item["word_count"],
                item["char_count"]
            )

    faiss.write_index(index, index_output_name)
    print(f"[✔] FAISS index saved to: {index_output_name}")
    print(f"[ℹ] Skipped chunks due to rate limits or API errors: {skipped_chunks}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--jsonl", required=True, help="Path to .jsonl file")
    parser.add_argument("--index", required=True, help="Output FAISS index filename")
    args = parser.parse_args()

    main(args.jsonl, args.index)
