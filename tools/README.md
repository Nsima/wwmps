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

### ⚠️ Roadblocks & Gotchas

Here are a few bumps we’ve hit on the road to subtitle glory:

- 🧠 **Model too thicc!**  
  Tried using Whisper’s `medium` model, but it needs **~5GB of VRAM** — my GPU tapped out at **4GB**, so no dice.

- 💥 **Corrupt model download (SHA256 mismatch)**  
  Whisper refused to load a corrupted model file. Fixed by deleting the cache at:  
  `C:\Users\<YourName>\.cache\whisper`

- 🧾 **Subtitles not found (YouTube side)**  
  Some YouTube videos just don’t have subtitles — not even auto-generated. `yt-dlp` politely declined to help.

- 🎵 **Special character chaos**  
  Filenames with vertical bars `｜｜`, commas, or smart quotes caused `ffmpeg` to panic.  
  Solution: renamed files to simple ASCII names.

- 🐢 **CPU-only transcription = 🐌**  
  Without a proper GPU, Whisper is slow. Like… real slow. Best to keep audio short or switch to `base` model.

### 🔧 Planned Improvements

This tools folder is just getting started. Here’s what’s coming next:

- 📂 **Batch Whisper Transcription**  
  Auto-process all audio files in `tools/audio/` and save `.srt` files to `tools/subtitles/`.

- 🧹 **Filename Sanitizer**  
  Strip emojis, full-width characters, and weird symbols from audio filenames before processing.

- 🧠 **Model Auto-Selector**  
  Check available VRAM — use `medium` if GPU is strong, else fallback to `base` or CPU mode.

- 📊 **Transcript Quality Grader** *(experimental)*  
  Rate transcriptions by confidence or word clarity using Whisper’s logits or a post-processing pass.

- 🌍 **Translation Support**  
  Transcribe **and translate** non-English audio directly to English subtitles using Whisper’s multilingual capability.

- 🗃 **Metadata Extraction**  
  Save subtitle + audio metadata (title, duration, language, model used) to a `.csv` or SQLite DB.

- 🧪 **Unit Tests for CLI tools**  
  Add simple tests to validate that subtitle outputs exist and aren't empty.
