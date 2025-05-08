import argparse
import json
import faiss
import openai
import numpy as np
from config import OPENAI_API_KEY
from db import insert_metadata
from tqdm import tqdm

openai.api_key = OPENAI_API_KEY

def embed_text(text):
    response = openai.Embedding.create(input=text, model="text-embedding-ada-002")
    return response["data"][0]["embedding"]

def main(jsonl_path, index_output_name):
    index = faiss.IndexFlatL2(1536)

    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in tqdm(f, desc=f"Embedding: {jsonl_path}"):
            item = json.loads(line)
            chunk = item["chunk"]
            chunk_id = item["chunk_id"]

            vector = np.array(embed_text(chunk), dtype="float32")
            index.add(np.expand_dims(vector, axis=0))

            insert_metadata(
                chunk_id,
                item["title"],
                item["source_url"],
                item["transcription_date"],
                item["word_count"],
                item["char_count"]
            )

    faiss.write_index(index, index_output_name)
    print(f"[✔] FAISS index saved to: {index_output_name}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--jsonl", required=True, help="Path to .jsonl file")
    parser.add_argument("--index", required=True, help="Output FAISS index filename")
    args = parser.parse_args()

    main(args.jsonl, args.index)
