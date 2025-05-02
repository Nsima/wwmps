### 📓 Dev Diary: Cooking Up the Subtitle Scraper 🍿  
**Date:** April 30, 2025  
**By:** George Nsima (a.k.a. "Mr. Save my internet cost")

---

#### 🎯 Mission Brief

The goal? Build a smart, low-bandwidth pipeline to **grab subtitles from YouTube videos** — whether they come gift-wrapped (captions) or need to be crafted from scratch (via Whisper AI). Oh, and it had to use almost **zero local internet**, because data subscriptions here ain’t cheap.

So I spun up my trusty **GCP Ubuntu server**, gave it coffee, and put it to work.

---

#### 🎬 Episode 1: The Sub-Ripper Awakens (yt-dlp)

- Fired up `yt-dlp` to fetch subtitles like a pro.
- Learned about subtitle formats and language codes (`--list-subs`).
- Converted everything to `.srt` like a civilized dev.
- Wrote `youtubeScraper.py` to automate it.

**Plot twist:** Some videos didn’t have any captions at all 😤  
**Fix:** Enter Whisper — the AI transcription wizard.

---

#### 🤖 Episode 2: Whisper to the Rescue

- Installed Whisper and friends locally.
- Hit the **SHA256 mismatch** error — fixed it by deleting `.cache/whisper`.
- Discovered `medium` model needs ~5GB VRAM — and I had only 4GB 😩
- Dropped to the `base` model — still solid.
- Whisper worked its magic and gave me `.srt` files like a charm.

---

#### ☁️ Episode 3: Moving to the Cloud

- Gave GCP a mission: be my subtitle factory, let Google handle the downloading and transcription.
- Installed all tools: `yt-dlp`, `ffmpeg`, `whisper`
- Built out the folders:
  - `tools/audio/` → temp audio (deleted after use)
  - `tools/subtitles/` → all `.srt` gold
  - `tools/youtube_links.txt` → the hit list

- Crafted `auto_transcribe_and_sync.py`:
  - Reads the URL list
  - Downloads the audio
  - Transcribes it via Whisper
  - Deletes the audio (save space because its only 50GB of space)
  - Syncs `.srt` to Google Drive via `rclone`

---

#### 🧠 Tweaks I Made

- `processed_links.log`: So I don’t do double work
- `failed_links.log`: For links that didn’t make the cut
- `rclone`: Pushes just the `.srt` to Drive — lightweight, cheap, clean
- Cron-friendly: The script can run itself while I sleep (or you can use tmux)
- Live transcription logging with `tail -f transcription.log` in tmux

---

#### 🧱 Things That Tripped Me Up

- Whisper model downloads going corrupt mid-way
- Weird characters (like `｜｜`) breaking `ffmpeg`
- Videos without captions or auto-captions
- My GPU saying "nope, too heavy for me"
- Whisper on CPU? Let’s just say it makes my grandma look fast

---

#### ⚠️ Bonus Lessons

- Whisper will warn about `FP16 not supported on CPU` — harmless, expected.
- CPU-only Whisper transcription of a 30-minute audio can take 2+ hours.
- You can monitor resource usage with `top`, `ps aux`, or `stat` while in tmux.


#### 🚧 Next on the Roadmap

- Write `retry_failed.py` to give failed URLs a second chance
- Auto-log metadata (video title, duration, model used)
- Whisper + translation mode (multilingual → English subs)
- Dockerize everything (why not?)
- Build cleaner: `clean_srt_to_text.py` to turn .srt into raw NLP-friendly text
- Move to a different VPS because GCP billing by the hour makes no sense for this pet project
---

### 📜 Changelog

#### v0.1.1 - May 1, 2025
- Added live logging to `transcribe_audio()` using `subprocess.Popen`
- Now writes Whisper output to `transcription.log`
- Supports `tail -f` in tmux for real-time tracking

#### v0.1.0 - April 30, 2025
- First working version of the YouTube-to-Subtitle engine
- Added: `youtubeScraper.py`, `whisperBatch.py`, `auto_transcribe_and_sync.py`
- Integrated Whisper + yt-dlp + rclone
- Cleaned up audio files after use
- Added tracking with `processed_links.log` and `failed_links.log`