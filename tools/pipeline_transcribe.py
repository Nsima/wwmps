import os
import subprocess
import time
import argparse

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
    if not os.path.exists(YOUTUBE_LIST_FILE):
        return []
    with open(YOUTUBE_LIST_FILE, 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip()]

def load_processed():
    if not os.path.exists(PROCESSED_LOG):
        return set()
    with open(PROCESSED_LOG, 'r') as f:
        return set(line.strip() for line in f)

def mark_processed(identifier):
    with open(PROCESSED_LOG, 'a') as f:
        f.write(identifier + "\n")

def download_audio(url):
    print(f"[▶] Downloading: {url}")
    run_command([
        "yt-dlp", "-f", "bestaudio",
        "--extract-audio", "--audio-format", "mp3",
        "-o", os.path.join(AUDIO_DIR, "%(title)s.%(ext)s"),
        url
    ])

def list_existing_audio():
    return [f for f in os.listdir(AUDIO_DIR) if f.endswith('.mp3')]

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

def process_youtube_links():
    urls = read_urls()
    processed = load_processed()

    for url in urls:
        if url in processed:
            print(f"[⏭] Skipping: {url}")
            continue
        try:
            download_audio(url)
            time.sleep(2)
            audio_file = list_existing_audio()[-1] if list_existing_audio() else None
            if audio_file:
                transcribe(audio_file)
                mark_processed(url)
        except Exception as e:
            print(f"[❌] Failed: {url}\n{e}")

def process_existing_audio():
    print("[📂] Checking for existing audio files...")
    audio_files = list_existing_audio()
    processed = load_processed()

    for file in audio_files:
        identifier = f"local:{file}"
        if identifier in processed:
            print(f"[⏭] Skipping already processed audio: {file}")
            continue
        try:
            transcribe(file)
            mark_processed(identifier)
        except Exception as e:
            print(f"[❌] Failed to transcribe local file: {file}\n{e}")

def main():
    parser = argparse.ArgumentParser(description="Transcribe YouTube or Local Audio Files")
    parser.add_argument("--mode", choices=["youtube", "local", "both"], default="both",
                        help="Select mode: 'youtube', 'local', or 'both' (default: both)")
    args = parser.parse_args()

    if args.mode in ["youtube", "both"]:
        process_youtube_links()

    if args.mode in ["local", "both"]:
        process_existing_audio()

if __name__ == "__main__":
    main()
