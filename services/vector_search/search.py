# fastapi_app/main.py
from fastapi import FastAPI, Request
import uvicorn
import json
import faiss
import numpy as np
import os
from sentence_transformers import SentenceTransformer
from typing import Dict, Any

app = FastAPI()

@app.get("/ping")
async def ping():
    return {"status": "Model is live!"}

# ---- Embedding model (one-time load)
#model = INSTRUCTOR("hkunlp/instructor-base")  # You can switch to "instructor-small"
#model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
model = SentenceTransformer("sentence-transformers/distiluse-base-multilingual-cased-v1")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# ---- Map index names to files (adjust paths to your repo layout)
# e.g. tools/indexes/<slug>.faiss and tools/id_maps/<slug>.json
INDEX_MAP: Dict[str, Dict[str, Any]] = {
    "vectordb-oyedepo": {
        "slug": "oyedepo",
        "faiss_path": os.path.join(BASE_DIR, "tools", "indexes", "oyedepo.faiss"),
        "map_path":  os.path.join(BASE_DIR, "tools", "id_maps", "oyedepo.json"),
    },
    "vectordb-adeboye": {
        "slug": "adeboye",
        "faiss_path": os.path.join(BASE_DIR, "tools", "indexes", "adeboye.faiss"),
        "map_path":  os.path.join(BASE_DIR, "tools", "id_maps", "adeboye.json"),
    },
    "vectordb-adefarasin": {
        "slug": "adefarasin",
        "faiss_path": os.path.join(BASE_DIR, "tools", "indexes", "adefarasin.faiss"),
        "map_path":  os.path.join(BASE_DIR, "tools", "id_maps", "adefarasin.json"),
    },
    "vectordb-ibiyeomie": {
        "slug": "ibiyeomie",
        "faiss_path": os.path.join(BASE_DIR, "tools", "indexes", "ibiyeomie.faiss"),
        "map_path":  os.path.join(BASE_DIR, "tools", "id_maps", "ibiyeomie.json"),
    },
}

# ---- Lazy cache of loaded FAISS indexes + id mappings
CACHE: Dict[str, Dict[str, Any]] = {}

def load_index_bundle(index_name: str) -> Dict[str, Any]:
    if index_name in CACHE:
        return CACHE[index_name]
    cfg = INDEX_MAP.get(index_name)
    if not cfg:
        # Default (fallback) to Oyedepo if unknown index
        cfg = INDEX_MAP["vectordb-oyedepo"]
        index_name = "vectordb-oyedepo"

    faiss_index = faiss.read_index(cfg["faiss_path"])
    with open(cfg["map_path"], "r", encoding="utf-8") as f:
        id_mapping = json.load(f)

    bundle = {
        "slug": cfg["slug"],
        "index": faiss_index,
        "id_mapping": id_mapping,
    }
    CACHE[index_name] = bundle
    return bundle

@app.post("/search")
async def search(request: Request):
    data = await request.json()
    query = data.get("query")
    top_k = int(data.get("top_k", 5))
    index_name = data.get("index")  # e.g. "vectordb-oyedepo"

    if not query:
        return {"error": "Missing 'query' in request body"}

    bundle = load_index_bundle(index_name or "vectordb-oyedepo")
    faiss_index = bundle["index"]
    id_mapping = bundle["id_mapping"]
    pastor_slug = bundle["slug"]

    # Encode query
    vec = model.encode([query])
    vec = np.asarray(vec, dtype="float32")

    # Search
    # Pull a few extra in case some ids are missing from mapping for any reason
    search_k = max(top_k, 10)
    distances, indices = faiss_index.search(vec, search_k)
    raw_ids = indices[0].tolist()

    # Map FAISS row ids -> external chunk_ids
    chunk_ids = []
    for i in raw_ids:
        # guard against -1 (faiss can return -1 if not enough vectors)
        if i == -1:
            continue
        mapped = id_mapping.get(str(i)) if isinstance(id_mapping, dict) else id_mapping[i]
        if mapped:
            chunk_ids.append(mapped)
        if len(chunk_ids) >= top_k:
            break

    return {
        "chunk_ids": chunk_ids,
        "pastor_slug": pastor_slug,
        "index": index_name or "vectordb-oyedepo",
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
