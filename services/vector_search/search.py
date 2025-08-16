# search_service.py
import os
import json
import faiss
import numpy as np
import psycopg2
import psycopg2.extras
from typing import Dict, Tuple, List
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

TOOLS_DIR = os.getenv("TOOLS_DIR", "tools")
INDEX_DIR = os.path.join(TOOLS_DIR, "indexes")
MAP_DIR   = os.path.join(TOOLS_DIR, "id_maps")
METRIC    = os.getenv("FAISS_METRIC", "ip").lower()  # 'ip' or 'l2'

DB_URL = os.getenv("DATABASE_URL")  # recommended
if not DB_URL:
    # fallback pieces (mirrors your loader defaults)
    DB_URL = f"postgresql://{os.getenv('PGUSER','postgres')}:{os.getenv('PGPASSWORD','password')}@" \
             f"{os.getenv('PGHOST','localhost')}:{os.getenv('PGPORT','5432')}/{os.getenv('PGDATABASE','Chatbot')}"

MODEL_NAME = os.getenv("EMBED_MODEL", "BAAI/bge-base-en-v1.5")
BGE_QUERY_PREFIX = os.getenv("BGE_QUERY_PREFIX", "query: ")  # Safe default for BGE

app = FastAPI(title="WWMPS Search Service")

_model = SentenceTransformer(MODEL_NAME)
_index_cache: Dict[str, Tuple[faiss.Index, Dict[str, str]]] = {}  # pastor_slug -> (index, id_map)

def load_index(pastor_slug: str) -> Tuple[faiss.Index, Dict[str, str]]:
    if pastor_slug in _index_cache:
        return _index_cache[pastor_slug]
    idx_path = os.path.join(INDEX_DIR, f"{pastor_slug}.faiss")
    map_path = os.path.join(MAP_DIR, f"{pastor_slug}.json")
    if not os.path.exists(idx_path) or not os.path.exists(map_path):
        raise FileNotFoundError(f"Missing index/map for pastor '{pastor_slug}'")

    index = faiss.read_index(idx_path)
    with open(map_path, "r", encoding="utf-8") as f:
        id_map = json.load(f)
        id_map = {str(k): v for k, v in id_map.items()} if isinstance(id_map, dict) else {str(i): v for i, v in enumerate(id_map)}
    _index_cache[pastor_slug] = (index, id_map)
    return index, id_map

def embed_query(q: str) -> np.ndarray:
    text = f"{BGE_QUERY_PREFIX}{q}".strip()
    vec = _model.encode([text], convert_to_numpy=True, normalize_embeddings=False).astype("float32")
    if METRIC == "ip":
        faiss.normalize_L2(vec)
    return vec

class SearchRequest(BaseModel):
    query: str
    pastor_slug: str
    k: int = 8

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/query")
def query(req: SearchRequest):
    try:
        index, id_map = load_index(req.pastor_slug)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    qvec = embed_query(req.query)
    D, I = index.search(qvec, req.k)

    # Map FAISS row ids -> chunk_ids
    row_ids = [str(int(i)) for i in I[0] if int(i) >= 0]
    if not row_ids:
        return {"results": []}

    chunk_ids = [id_map[rid] for rid in row_ids]

    # Fetch rows in one round trip, keep score order
    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("""
                SELECT chunk_id, chunk, title, source_url, transcription_date, word_count, char_count, pastor_slug
                FROM sermon_chunks
                WHERE chunk_id = ANY(%s);
            """, (chunk_ids,))
            rows = {row["chunk_id"]: dict(row) for row in cur.fetchall()}

    # Build ordered results with scores (cosine/IP higher is better, L2 lower is better)
    scored = []
    for pos, rid in enumerate(row_ids):
        cid = id_map[rid]
        score = float(D[0][pos])
        scored.append({
            "chunk_id": cid,
            "score": score,
            **rows.get(cid, {"chunk": None, "title": None, "source_url": None, "transcription_date": None,
                             "word_count": None, "char_count": None, "pastor_slug": req.pastor_slug})
        })

    # If L2, sort ascending; if IP, sort descending (FAISS already returns ordered, but safe)
    reverse = (METRIC == "ip")
    scored.sort(key=lambda x: x["score"], reverse=reverse)

    return {"metric": METRIC, "results": scored}
