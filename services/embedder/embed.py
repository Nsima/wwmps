# services/embedder/embed.py
import json
import openai
import pinecone
from tqdm import tqdm
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize Pinecone
pinecone.init(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment=os.getenv("PINECONE_ENV")
)

index = pinecone.Index(os.getenv("PINECONE_INDEX"))

def embed_text(text):
    response = openai.Embedding.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response['data'][0]['embedding']

with open("tools/ready_for_embedding.jsonl", "r", encoding="utf-8") as f:
    for line in tqdm(f):
        record = json.loads(line)
        chunk = record["chunk"]
        metadata = {
            "title": record["title"],
            "chunk_id": record["chunk_id"],
            "source_url": record["source_url"],
            "transcription_date": record["transcription_date"]
        }

        vector = embed_text(chunk)
        index.upsert([(record["chunk_id"], vector, metadata)])
