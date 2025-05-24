from fastapi import FastAPI, Request
import uvicorn
import json
import faiss
import numpy as np
import os
from InstructorEmbedding import INSTRUCTOR

app = FastAPI()

# Load embedding model and FAISS index
model = INSTRUCTOR("hkunlp/instructor-base")
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
index = faiss.read_index(os.path.join(BASE_DIR, "tools", "sermons.faiss"))

# Load chunk_id mapping
with open(os.path.join(BASE_DIR, "tools", "id_mapping.json"), "r") as f:
    id_mapping = json.load(f)

@app.post("/search")
async def search(request: Request):
    data = await request.json()
    query = data.get("query")
    top_k = data.get("top_k", 5)

    if not query:
        return {"error": "Missing 'query' in request body"}

    # Embed the query with instruction
    instruction = "Represent the meaning of this sentence for semantic search"
    vector = model.encode([[instruction, query]])
    vector = np.array(vector).astype("float32")

    # Search in FAISS
    distances, indices = index.search(vector, top_k)
    chunk_ids = [id_mapping[i] for i in indices[0]]

    return {"chunk_ids": chunk_ids}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
