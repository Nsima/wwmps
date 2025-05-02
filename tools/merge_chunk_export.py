import os
import json
from datetime import datetime

METADATA_PATH = "tools/subtitle_metadata.json"
CLEAN_TEXT_DIR = "tools/clean_text"
OUTPUT_JSONL = "tools/ready_for_embedding.jsonl"

CHUNK_SIZE = 200        # words per chunk
CHUNK_OVERLAP = 50      # overlapping words between chunks

def load_metadata():
    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def load_clean_text(file_name):
    txt_path = os.path.join(CLEAN_TEXT_DIR, file_name.replace(".srt", ".txt"))
    if not os.path.exists(txt_path):
        return None
    with open(txt_path, "r", encoding="utf-8") as f:
        return f.read()

def chunk_text(text, size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + size
        chunk_words = words[start:end]
        chunks.append(" ".join(chunk_words))
        if end >= len(words):
            break
        start += size - overlap
    return chunks

def generate_jsonl():
    metadata_list = load_metadata()
    with open(OUTPUT_JSONL, "w", encoding="utf-8") as out_file:
        for meta in metadata_list:
            text = load_clean_text(meta["file_name"])
            if not text:
                print(f"[⚠️] Missing clean text for {meta['file_name']}")
                continue

            chunks = chunk_text(text)
            for i, chunk in enumerate(chunks):
                record = {
                    "chunk": chunk,
                    "chunk_id": f"{meta['title'].replace(' ', '_')}_{i+1}",
                    "title": meta["title"],
                    "source_url": meta["source_url"],
                    "transcription_date": meta["transcription_date"],
                    "word_count": len(chunk.split()),
                    "char_count": len(chunk)
                }
                out_file.write(json.dumps(record) + "\n")

    print(f"[✅] Exported {OUTPUT_JSONL} with all chunks ready for embedding.")

if __name__ == "__main__":
    generate_jsonl()
