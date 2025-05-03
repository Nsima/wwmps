# ===========================
# 📄 pipeline_transcribe.py
# ===========================

import os
import subprocess
import time

YOUTUBE_LIST_FILE = "tools/youtube_links.txt"
PROCESSED_LOG = "tools/processed_links.log"
AUDIO_DIR = "tools/audio"
SUBTITLE_DIR = "tools/subtitles"
WHISPER_MODEL = "base"

os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(SUBTITLE_DIR, exist_ok=True)

def run_command(cmd):
    subprocess.run(cmd, check=True)

def read_urls():
    with open(YOUTUBE_LIST_FILE, 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip()]

def load_processed():
    if not os.path.exists(PROCESSED_LOG): return set()
    with open(PROCESSED_LOG, 'r') as f:
        return set(line.strip() for line in f)

def mark_processed(url):
    with open(PROCESSED_LOG, 'a') as f:
        f.write(url + "\n")

def download_audio(url):
    print(f"[▶] Downloading: {url}")
    run_command([
        "yt-dlp", "-f", "bestaudio",
        "--extract-audio", "--audio-format", "mp3",
        "-o", os.path.join(AUDIO_DIR, "%(title)s.%(ext)s"),
        url
    ])

def get_latest_audio():
    files = sorted([f for f in os.listdir(AUDIO_DIR) if f.endswith('.mp3')],
                   key=lambda f: os.path.getmtime(os.path.join(AUDIO_DIR, f)),
                   reverse=True)
    return files[0] if files else None

def transcribe(file):
    input_path = os.path.join(AUDIO_DIR, file)
    print(f"[🧠] Transcribing: {file}")
    run_command([
        "whisper", input_path, "--model", WHISPER_MODEL,
        "--language", "English", "--output_format", "srt",
        "--output_dir", SUBTITLE_DIR
    ])
    os.remove(input_path)
    print(f"[🧹] Deleted audio: {file}")

def main():
    urls = read_urls()
    processed = load_processed()

    for url in urls:
        if url in processed:
            print(f"[⏭] Skipping: {url}")
            continue
        try:
            download_audio(url)
            time.sleep(2)
            audio_file = get_latest_audio()
            if audio_file:
                transcribe(audio_file)
                mark_processed(url)
        except Exception as e:
            print(f"[❌] Failed: {url}\n{e}")

if __name__ == "__main__":
    main()