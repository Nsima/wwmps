import subprocess
import os

def download_youtube_subs(url, lang='en', fmt='srt', output_dir="subtitles"):
    os.makedirs(output_dir, exist_ok=True)
    command = [
        "yt-dlp",
        "--write-auto-sub",
        f"--sub-lang={lang}",
        "--skip-download",
        f"--convert-subs={fmt}",
        "-o", os.path.join(output_dir, "%(title)s.%(ext)s"),
        url
    ]
    print(f"[INFO] Downloading subtitles for: {url}")
    result = subprocess.run(command, capture_output=True, text=True)

    if "There aren't any subtitles" in result.stderr:
        print("[WARN] No subtitles available for this video.")
    else:
        print("[✅] Subtitle download complete.")

# Example usage
if __name__ == "__main__":
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    download_youtube_subs(test_url)
