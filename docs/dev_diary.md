### 📓 Dev Diary: Cooking Up the Subtitle Scraper 🍿  
**Date:** April 30 – May 1, 2025  
**By:** George Nsima (a.k.a. "Mr. Save My Internet Cost")

---

#### 🎯 Mission Brief

The goal? Build a smart, low-bandwidth pipeline to **grab subtitles from YouTube videos** — whether they come gift-wrapped (captions) or need to be crafted from scratch (via Whisper AI). Oh, and it had to use almost **zero local internet**, because data subscriptions here ain’t cheap.

So I spun up my trusty **GCP Ubuntu server**, gave it some tasks, and let it crunch away.

---

#### 🎬 Episode 1: The Sub-Ripper Awakens (yt-dlp)

- Fired up `yt-dlp` to fetch subtitles like a pro.
- Learned about subtitle formats and language codes (`--list-subs`).
- Converted everything to `.srt` like a civilized dev.
- Wrote `youtubeScraper.py` to automate the process.

**Plot twist:** Some videos didn’t have any captions at all 😤  
**Fix:** Enter Whisper — the AI transcription wizard.

---

#### 🤖 Episode 2: Whisper to the Rescue

- Installed Whisper and friends locally.
- Hit the **SHA256 mismatch** error — fixed it by deleting `.cache/whisper`.
- Found out the `medium` model needs ~5GB VRAM — but I had only 4GB 😩
- Dropped to the `base` model — still solid.
- Whisper worked its magic and gave me `.srt` files like a charm.

---

#### ☁️ Episode 3: Moving to the Cloud

- Gave GCP a mission: be my subtitle factory.
- Installed tools: `yt-dlp`, `ffmpeg`, `whisper`, `rclone`
- Built out folders:
  - `tools/audio/` → temp audio files (auto-deleted)
  - `tools/subtitles/` → goldmine of `.srt`
  - `tools/youtube_links.txt` → the hit list

- Crafted `auto_transcribe_and_sync.py` to:
  - Read the URL list
  - Download audio
  - Transcribe with Whisper
  - Delete audio to save space (50GB limit!)
  - Sync `.srt` to Google Drive using `rclone`

---

#### 🧠 Smart Tweaks

- `processed_links.log`: to prevent reprocessing
- `failed_links.log`: to retry later
- `rclone`: uploads only `.srt` → cheap & effective
- Cron-ready: fully automatable with `tmux`
- Added live logging: `tail -f transcription.log` while Whisper runs

---

#### 🧱 Gotchas & Glitches

- Whisper downloads corrupted mid-way (cache issue)
- Video titles with symbols like `｜｜` broke `ffmpeg`
- Some videos just don’t have captions
- Whisper on CPU is **painfully slow** — 30-min video = ~2 hours
- My poor GPU couldn’t keep up — Whisper said “nah bro”

---

#### 📦 Microservices & Docker Move

- Split the pipeline into microservices:
  - `transcriber` → Whisper engine
  - `cleaner` → `.srt` to raw text
  - `embedder` → prepare for vector DB
  - `vector_search` → FAISS or Pinecone wrapper
  - `llm_inference` → handle OpenAI or fine-tuned answers
  - `metadata` → title, tags, URL annotation
- Created `docker-compose.yml` to run all services locally
- Created a plan for future autoscaling + GCP deployment

---

#### ⚠️ Bonus Lessons

- Whisper will warn: `FP16 not supported on CPU` — ignore it.
- Use `top` or `ps aux` to check CPU/RAM usage in tmux.
- Use `stat` or `ls -lh` to monitor file size growth.
- Delete audio ASAP — `.mp3` files eat disk fast.

---

#### 🚧 Next on the Roadmap

- [ ] `retry_failed.py`: Auto-retry links that failed
- [ ] Add metadata extractor to auto-log title, duration, model
- [ ] Translation mode: non-English to English via Whisper
- [ ] Polish `clean_srt_to_text.py` for better chunking & cleaning
- [ ] Build `.jsonl` chunker → ready for embedding
- [ ] Create Dockerfiles for each microservice
- [ ] Explore Pinecone vs FAISS for vector DB
- [ ] Add a FastAPI query endpoint for the frontend
- [ ] Move away from GCP billing (hourly charges stack up!)

---

### 📜 Changelog

#### v0.4.0 - May 1, 2025
- Added Docker Compose setup for microservices
- Microservices now include transcriber, cleaner, embedder, vector search, inference, metadata

#### v0.3.0 - May 1, 2025
- Token-aware chunking, embedding cost estimator
- Exported `ready_for_embedding.jsonl`

#### v0.2.0 - May 1, 2025
- Added metadata extraction and merging with `.txt`
- Cleaned `.srt` to raw text format

#### v0.1.1 - May 1, 2025
- Added live logging to Whisper transcription
- Created `transcription.log` for tmux + `tail -f`

#### v0.1.0 - April 30, 2025
- First working version of the YouTube-to-Subtitle pipeline
- `youtubeScraper.py`, `whisperBatch.py`, `auto_transcribe_and_sync.py`
- Whisper + yt-dlp + rclone fully integrated
- Audio files cleaned post-transcription
- Logs added for processed and failed links
