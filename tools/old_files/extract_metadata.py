import os
import json
import re
from datetime import datetime

SUBTITLE_DIR = "tools/subtitles"
PROCESSED_LOG = "tools/processed_links.log"
OUTPUT_JSON = "tools/subtitle_metadata.json"

def extract_title_from_filename(filename):
    return os.path.splitext(filename)[0].replace('_', ' ').strip()

def match_url_from_log(title):
    if not os.path.exists(PROCESSED_LOG):
        return "unknown"
    with open(PROCESSED_LOG, "r", encoding="utf-8") as f:
        for line in f:
            url = line.strip()
            if title.lower().replace(" ", "") in url.lower().replace(" ", ""):
                return url
    return "unknown"

def compute_stats(text):
    words = text.split()
    return len(words), len(text)

def read_srt_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()

def extract_metadata():
    metadata = []

    for file in os.listdir(SUBTITLE_DIR):
        if file.endswith(".srt"):
            path = os.path.join(SUBTITLE_DIR, file)
            srt_text = read_srt_file(path)

            title = extract_title_from_filename(file)
            url = match_url_from_log(title)
            word_count, char_count = compute_stats(srt_text)

            metadata.append({
                "file_name": file,
                "title": title,
                "source_url": url,
                "transcription_date": datetime.utcnow().isoformat(),
                "word_count": word_count,
                "char_count": char_count
            })

    with open(OUTPUT_JSON, "w", encoding="utf-8") as jsonfile:
        json.dump(metadata, jsonfile, indent=2)

    print(f"[✅] Metadata saved to {OUTPUT_JSON}")

if __name__ == "__main__":
    extract_metadata()
