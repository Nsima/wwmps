import os
import subprocess
import time

# === CONFIGURATION ===
YOUTUBE_LIST_FILE = "tools/youtube_links.txt"
PROCESSED_LOG = "tools/processed_links.log"
AUDIO_DIR = "tools/audio"
SUBTITLE_DIR = "tools/subtitles"
WHISPER_MODEL = "base"
RCLONE_REMOTE = "gdrive"
RCLONE_REMOTE_FOLDER = "yt-subs"

def run_command(command, check=True):
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if check and result.returncode != 0:
        raise subprocess.CalledProcessError(result.returncode, command, result.stdout, result.stderr)
    return result

def read_video_urls(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]

def load_processed_links():
    if not os.path.exists(PROCESSED_LOG):
        return set()
    with open(PROCESSED_LOG, "r", encoding="utf-8") as f:
        return set(line.strip() for line in f if line.strip())

def mark_as_processed(url):
    with open(PROCESSED_LOG, "a", encoding="utf-8") as f:
        f.write(url + "\n")

def download_audio(url):
    os.makedirs(AUDIO_DIR, exist_ok=True)
    command = [
        "yt-dlp",
        "-f", "bestaudio",
        "--extract-audio",
        "--audio-format", "mp3",
        "-o", os.path.join(AUDIO_DIR, "%(title)s.%(ext)s"),
        url
    ]
    print(f"[▶] Downloading audio from: {url}")
    run_command(command)

def get_latest_audio_file():
    mp3_files = [f for f in os.listdir(AUDIO_DIR) if f.endswith(".mp3")]
    if not mp3_files:
        return None
    return sorted(mp3_files, key=lambda x: os.path.getmtime(os.path.join(AUDIO_DIR, x)), reverse=True)[0]

def transcribe_audio(file_name):
    os.makedirs(SUBTITLE_DIR, exist_ok=True)
    input_path = os.path.join(AUDIO_DIR, file_name)
    command = [
        "whisper",
        input_path,
        "--model", WHISPER_MODEL,
        "--language", "English",
        "--output_format", "srt",
        "--output_dir", SUBTITLE_DIR
    ]
    print(f"[🧠] Transcribing {file_name}...")
    run_command(command)

def delete_file(path):
    try:
        os.remove(path)
        print(f"[🧹] Deleted: {path}")
    except FileNotFoundError:
        print(f"[⚠️] File already deleted or missing: {path}")

def sync_to_gdrive():
    command = [
        "rclone",
        "copy",
        SUBTITLE_DIR,
        f"{RCLONE_REMOTE}:{RCLONE_REMOTE_FOLDER}"
    ]
    print(f"[☁️] Syncing subtitles to Google Drive...")
    run_command(command)

def process_video(url):
    try:
        download_audio(url)
        time.sleep(2)
        audio_file = get_latest_audio_file()
        if not audio_file:
            print(f"[❌] No audio file found after downloading: {url}")
            return
        transcribe_audio(audio_file)
        delete_file(os.path.join(AUDIO_DIR, audio_file))
    except subprocess.CalledProcessError as e:
        print(f"[💥 ERROR] Command failed: {e.cmd}\n{e.stderr}")
    except Exception as e:
        print(f"[❗ UNEXPECTED ERROR] {str(e)}")

def main():
    urls = read_video_urls(YOUTUBE_LIST_FILE)
    processed = load_processed_links()

    for url in urls:
        if url in processed:
            print(f"[⏭] Skipping already processed: {url}")
            continue
        process_video(url)
        mark_as_processed(url)

    """sync_to_gdrive()"""
    print("[✅] All videos processed and .srt files synced to Drive.")

if __name__ == "__main__":
    main()
