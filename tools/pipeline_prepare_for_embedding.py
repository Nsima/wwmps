# ===========================
# 📄 pipeline_prepare_for_embedding.py
# ===========================

import os
import json
import re
from pathlib import Path
from nltk.tokenize import sent_tokenize

SUBTITLE_DIR = "tools/subtitles"
TEXT_DIR = "tools/cleaned"
FINAL_OUTPUT = "tools/ready_for_embedding.jsonl"

os.makedirs(TEXT_DIR, exist_ok=True)

def clean_srt(srt_path):
    with open(srt_path, 'r', encoding='utf-8') as f:
        raw = f.read()
    lines = raw.split('\n')
    text_lines = [line for line in lines if not line.strip().isdigit()
                  and not re.match(r"\d{2}:\d{2}:\d{2},\d{3} -->", line)
                  and '[Music]' not in line]
    cleaned = ' '.join(text_lines)
    return re.sub(r'[^\w\s.,!?\'\"]+', '', cleaned)

def chunk_text(text, chunk_size=400):
    sentences = sent_tokenize(text)
    chunks, current = [], ""
    for sent in sentences:
        if len(current) + len(sent) < chunk_size:
            current += " " + sent
        else:
            chunks.append(current.strip())
            current = sent
    if current:
        chunks.append(current.strip())
    return chunks

def extract_metadata(filename):
    title = filename.replace(".srt", "").replace("_", " ")
    return {"title": title, "source": filename}

def main():
    entries = []
    for file in os.listdir(SUBTITLE_DIR):
        if not file.endswith('.srt'): continue
        cleaned = clean_srt(os.path.join(SUBTITLE_DIR, file))
        meta = extract_metadata(file)
        chunks = chunk_text(cleaned)
        for chunk in chunks:
            entries.append({
                "text": chunk,
                "metadata": meta
            })
        print(f"[✓] Processed: {file} → {len(chunks)} chunks")

    with open(FINAL_OUTPUT, 'w', encoding='utf-8') as f:
        for e in entries:
            f.write(json.dumps(e, ensure_ascii=False) + '\n')
    print(f"[📦] Saved: {FINAL_OUTPUT}")

if __name__ == "__main__":
    main()
