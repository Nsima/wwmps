### 📓 Developer Diary: Subtitle Automation Pipeline  
**Date:** April 30, 2025  
**Author:** George Nsima

---

#### 📌 Project Goal

Build an efficient, low-bandwidth system to **extract subtitles from YouTube videos**, either directly via captions or by **generating transcripts using Whisper**, and save the results in `.srt` format — with **minimal impact on local internet usage**.

My main constraint was **limited data subscription** on my local ISP, so I opted to offload the heavy lifting to my **GCP Ubuntu server**, which has better bandwidth and compute capabilities.

---

#### ✅ Phase 1: Subtitle Scraping (yt-dlp)

- Tested `yt-dlp` locally to download subtitles.
- Learned how to list available subtitle languages and formats (`--list-subs`).
- Used `--convert-subs srt` for clean output.
- Built `youtubeScraper.py` to automate single subtitle downloads.

**Obstacle:** Some videos didn’t have captions at all.  
**Solution:** Pivoted to generating subtitles with OpenAI’s Whisper.

---

#### ✅ Phase 2: Whisper Transcription

- Installed Whisper and dependencies locally.
- Resolved checksum errors by clearing the `.cache/whisper` folder.
- Realized Whisper’s `medium` model needs ~5GB VRAM; my GPU only had ~4GB.
- Switched to the `base` model for reliable performance.
- Successfully transcribed `.mp3` files into `.srt` using Whisper CLI.

---

#### ✅ Phase 3: Automation on GCP Server

- Provisioned GCP Ubuntu VM with 50GB disk space.
- Installed: `yt-dlp`, `ffmpeg`, `whisper`, `torch`, and `rclone`.
- Set up folder structure:
  - `tools/audio/` → audio files (auto-deleted)
  - `tools/subtitles/` → subtitle files
  - `tools/youtube_links.txt` → input URLs

- Built `auto_transcribe_and_sync.py`:
  - Reads YouTube links
  - Downloads audio using `yt-dlp`
  - Transcribes using Whisper
  - Deletes audio after transcription
  - Syncs `.srt` files to Google Drive using `rclone`

---

#### 🧠 Key Optimizations Added

- `processed_links.log`: Skips already-processed videos
- `failed_links.log`: Logs failed videos for retry
- `rclone` integration: Keeps GDrive in sync
- Cron-ready design: Can be scheduled automatically

---

#### ⚠️ Roadblocks Faced

- Corrupted Whisper model downloads (SHA mismatch)
- Filenames with special characters breaking `ffmpeg`
- Videos without subtitles
- Local VRAM limitations
- Slow CPU-only transcription

---

#### 🚀 What's Next

- `retry_failed.py` to process failed links
- Add metadata logging for every transcription
- Auto-translation support with Whisper
- Containerize with Docker for portability

---

### 🗓 Changelog

#### v0.1.0 - April 30, 2025
- Initial implementation of full YouTube-to-Subtitle automation
- Added `youtubeScraper.py`, `whisperBatch.py`, and `auto_transcribe_and_sync.py`
- Integrated Whisper + yt-dlp + rclone
- Added audio auto-deletion
- Built tracking logs: `processed_links.log` and `failed_links.log`
