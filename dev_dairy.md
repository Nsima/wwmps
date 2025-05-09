# 🛠️ Dev Diary — What Would My Pastor Say (WWMPS)

Welcome to my little back-end-of-the-frontend (and now back-end-of-the-backend) brain dump! This is where I’m keeping track of everything I’ve built, broken, re-built, and duct-taped together for this AI-powered chatbot.

## Caveat: I'm not the best at UI, but I'm not afraid to build a distributed sermon-processing pipeline either.
---

## 📅 Day 1: The Vision
Started with a simple idea: *"What would Pastor Oyedepo say if someone asked him this?"* That’s it. The goal? Let users ask questions and receive AI-generated reflections grounded in sermons and teachings from Nigerian pastors.

- Chose the stack: **Next.js + Tailwind + Node.js (Backend later) + OpenAI**
- Folder structure defined with `frontend/`, `backend/`, `services/`
- Built the initial `page.tsx` layout

---

## 💻 Day 2: UI Mock + Component Shells
The wireframe design came to life:
- Header: `What would [Pastor X] say?`
- Model Selector Dropdown
- Text input box for user questions
- Output box for AI response (spiritual reflections)
- Added Submit button (yes, chatbot, not magic)

Modularized into:
- `ModelSelector.tsx`
- `QuestionInput.tsx`
- `ReflectionOutput.tsx`

---

## 🧪 Day 3: Chatbot Mode Activated
Shifted from a single response to full-on **chat mode**:
- Messages stack like a chat thread
- User on the right, Pastor on the left
- Added message list state + AI placeholder response

---

## 🔄 Day 4: Dynamic Header
Made the header feel more human:
> "What would Pastor Oyedepo say?"

Changed automatically when a different pastor is selected.

---

## 📱 Day 5: Mobile First (Fix the Input!)
On mobile, the input was misbehaving — off-screen, blocked by keyboard.
- Applied `sticky bottom-0` to input container
- Used `100dvh` for better viewport handling

---

## 🧩 Day 6: Sidebar + Conversation Toggle
- Sidebar now toggleable (slide-in/out)
- Cleaned up the chat focus experience

---

## 📓 Day 7: Subtitle Scraper Saga 🍿  
**Date:** April 30 – May 3, 2025  
Started building a subtitle extraction pipeline for sermon videos:

### Episode 1: The Sub-Ripper Awakens
- Used `yt-dlp` + `youtubeScraper.py` to download `.srt`
- Fallback to Whisper when no captions found

### Episode 2: Whisper to the Rescue
- Installed Whisper locally (base model)
- SHA256 cache error fixed
- Whisper now auto-generates `.srt` from audio

### Episode 3: Moving to the Cloud
- Moved pipeline to GCP (Whisper + yt-dlp + ffmpeg + rclone)
- Auto-transcribes and syncs `.srt` to Drive
- Created `pipeline_transcribe.py` to streamline the job

### Episode 4: Pipeline Consolidation
- Merged cleaning + metadata + chunking into `pipeline_prepare_for_embedding.py`
- Output is `.jsonl`, ready for embedding
- Fully automated — 2 scripts, full pipeline

### Episode 5: Dual Input Optimization
- Added support for both **YouTube video links** and **already-downloaded audio files**
- CLI option allows running with `--mode youtube`, `--mode local`, or `--mode both`
- Prevents re-processing already handled files with smart logging

---

## 🧠 Day 8: Embedding Pipeline + FAISS + PostgreSQL Setup
- Created `.jsonl` files per pastor
- Built `embed_faiss.py` to:
  - Use OpenAI `text-embedding-ada-002`
  - Save vectors to individual FAISS index files
- Stored metadata to PostgreSQL via `db.py`
- Added `.env` for secure API and DB credentials
- Gracefully handles:
  - SSL issues on Windows
  - OpenAI SDK migration (v1.x compatibility)
  - Quota and rate limit errors

---

## 🐳 Day 9: Microservices + Docker Compose
- Split each step into Python microservices:
  - `transcriber`, `cleaner`, `embedder`, `vector_search`, `inference`, `metadata`
- Dockerized each service
- `docker-compose.yml` launches entire pipeline stack locally
- Future-proofed for CI/CD and autoscaling on GCP

---

## 📜 Changelog Highlights

### v0.3.0 - May 8, 2025
- Added dual-input pipeline mode (YouTube + Local audio)
- CLI options to control transcription source
    To process YouTube URLs only
    - `python pipeline_transcribe.py --mode youtube`
    Process local audio files only
    - `python pipeline_transcribe.py --mode local`
    Process both (default behavior)
    - `python pipeline_transcribe.py`

### v0.2.0 - May 3, 2025
- Docker Compose setup for all AI microservices
- Combined multiple tools into:
  - `pipeline_transcribe.py`
  - `pipeline_prepare_for_embedding.py`

### v0.1.x - May 1–2, 2025
- Token-aware chunking
- Live Whisper transcription logs
- `.srt` → `.txt` → `.jsonl` embedding-ready pipeline

---

## 🧼 Notes + What’s Next
- [ ] Add FAISS search + semantic retrieval service
- [ ] Connect to GPT for context-aware responses
- [ ] Build Node.js API gateway (RAG backend)
- [ ] `retry_failed.py` for broken video links
- [ ] Compare FAISS vs Pinecone in production
- [ ] Implement translation support (non-English sermons)
- [ ] Add feedback/rating system to chatbot
- [ ] Clean Docker deployment for GCP billing efficiency

—

— **Dev-in-faith** ✝️
