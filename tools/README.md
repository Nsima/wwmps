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
