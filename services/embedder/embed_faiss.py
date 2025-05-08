import json, faiss, openai, numpy as np
from config import OPENAI_API_KEY
from db import insert_metadata
from tqdm import tqdm

openai.api_key = OPENAI_API_KEY

def embed_text(text):
    response = openai.Embedding.create(input=text, model="text-embedding-ada-002")
    return response["data"][0]["embedding"]

def main():
    index = faiss.IndexFlatL2(1536)
    with open("data/chunks.jsonl", "r", encoding="utf-8") as f:
        for line in tqdm(f, desc="Embedding chunks"):
            item = json.loads(line)
            chunk = item["chunk"]
            vector = np.array(embed_text(chunk), dtype="float32")
            index.add(np.expand_dims(vector, axis=0))

            insert_metadata(
                item["chunk_id"], item["title"], item["source_url"],
                item["transcription_date"], item["word_count"], item["char_count"]
            )

    faiss.write_index(index, "index.faiss")
    print("[✔] FAISS index saved to index.faiss")

if __name__ == "__main__":
    main()
