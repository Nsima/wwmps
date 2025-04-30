# 📜 Tools for Subtitle Extraction and Generation

This folder contains scripts and command-line utilities used for downloading and generating data from the Web.

---

## 🔧 Setup

Install the dependencies:

```bash
# yt-dlp for downloading audio/subtitles from YouTube
pip install yt-dlp

# ffmpeg is required for audio processing (must be on PATH)
# Download from https://ffmpeg.org/download.html and add to PATH

# Whisper for speech-to-text transcription
pip install git+https://github.com/openai/whisper.git
pip install torch  # Install a compatible version of PyTorch for your system

## Bash Commands

# Download Audio from YouTube
yt-dlp -f bestaudio --extract-audio --audio-format mp3 -o "%(title)s.%(ext)s" "https://www.youtube.com/watch?v=VIDEO_ID"

# Generate Subtitles Using Whisper
whisper "Video Title.mp3" --model medium --language English --output_format srt

# Download Auto-Generated YouTube Subtitles (if available)
yt-dlp --write-auto-sub --sub-lang en --skip-download --convert-subs srt "https://www.youtube.com/watch?v=VIDEO_ID"

# List Available Subtitle Languages for a Video
yt-dlp --list-subs "https://www.youtube.com/watch?v=VIDEO_ID"
