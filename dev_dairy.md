# 🛠️ Dev Diary — What Would My Pastor Say (WWMPS)

Welcome to the (barely controlled) chaos that is building a full-stack AI chatbot fueled by Nigerian sermons. This is where I track what I’ve built, broken, revived, refactored, duct-taped, and pretended I understood the first time. All in the name of asking: *“What would Pastor Oyedepo say about... anything?”*

## ⚠️ Disclaimer: I might not be a UI genius, but I will absolutely build an offline vector search engine from scratch if you tempt me.

---

## 📅 Day 1: The “Aha” Moment
So it began...
> "What would Pastor Adefarasin say if someone asked him about the current state of Nigeria?"

Boom — that was the spark. Goal: AI-generated spiritual responses trained on sermons. Tech stack? Let’s get nerdy:
- **Next.js + Tailwind (frontend)**
- **Node.js API (RAG backend)**
- **PostgreSQL + FAISS**
- **Eventually ditch OpenAI and go full local with Ollama**

Initial folder structure built, `page.tsx` was born. The prophecy began.

---

## 💻 Day 2: Mockups & Pastor Personalities
- Created header: *What Would [Pastor] Say?*
- Added dropdown menu to pick your preacher
- Prompt input + response area
- Basically a holy Ask Jeeves.

Modularized into components (because real devs break it into components before they break down mentally):
- `ModelSelector.tsx`
- `QuestionInput.tsx`
- `ReflectionOutput.tsx`

---

## 💬 Day 3: Chat Mode Unlocked
- Replaced single output with threaded messages
- User messages on right, AI on left
- Added typing state
- Pastors respond like they’re in a WhatsApp group chat.

---

## 🪄 Day 4: Dynamic Headers
- When you switch pastors, the header updates like:
> “What would Pastor Adeboye say?”

Small change. Big vibe.

---

## 📱 Day 5: Mobile UI Madness
Turns out phones are small. Who knew?
- Fixed the input from jumping around
- Applied sticky `bottom-0`
- Adjusted viewport units with `100dvh`

Now it’s usable in church without crying.

---

## 🧩 Day 6: Sidebar Shenanigans
- Sidebar toggle for picking pastors mid-convo
- Sleek transitions, fewer distractions
- Much chat, very Spirit.

---

## 🎥 Day 7: The Subtitle Extraction Saga 🍿
**April 30 – May 3, 2025**

> Aka “The Week I Became a CLI Whisperer”

**Episode I: The Sub-Ripper Awakens**
- Used `yt-dlp` to grab `.srt` subtitle files
- Whisper steps in when no captions found

**Episode II: Whisper to the Rescue**
- Installed locally (and lived to tell the tale)
- Base model, fixed cache errors

**Episode III: Cloud Ascension**
- GCP deployment
- FFmpeg + rclone + cron magic
- `.srt` gets beamed to Google Drive like sermon scripture

**Episode IV: Pipeline Penance**
- Merged transcription → cleaning → chunking
- Final output: `.jsonl` chunks ready for vectorization

**Episode V: Dual Mode Domination**
- CLI flags: `--mode youtube`, `--mode local`, or both
- Smarter file checking = no re-processing

---

## 🧠 Day 8: Embedding Madness
- Used `InstructorEmbedding` (offline, zero API vibes)
- Embedded sermons chunk-by-chunk
- Stored vectors in FAISS
- Metadata went to PostgreSQL
- Built FastAPI search microservice
- Connected to Node.js via `searchService.js`

This was the point I whispered to myself: *“It is done.”*

---

## 🤖 Day 9: RAG Life + Ollama Inference
- Created `/api/query` endpoint in Node.js
- Accepts user question + selected pastor
- Retrieves semantically matched sermon chunks
- Builds dynamic prompt → sends to Ollama (local LLaMA3)
- Response gets streamed back to frontend
- All of this? Offline. API-less. Fully local RAG.

Frontend even shows a little *“Thinking...”* bubble now. ✨

---

## 🐳 Day 10: Containerize Everything
- Broke down pipeline into Python microservices:
  - `transcriber`, `cleaner`, `embedder`, `vector_search`, etc.
- Dockerized the whole stack
- `docker-compose up` = instant sermon AI factory

---

## 📜 Recent Changelog

### v0.3.0 — May 8, 2025
- Dual mode: YouTube & Local audio
- CLI: `--mode youtube`, `--mode local`, `--mode both`

### v0.2.0 — May 3, 2025
- Docker Compose setup
- Combined scripts into `pipeline_transcribe.py` + `prepare_for_embedding.py`

### v0.1.x — May 1–2, 2025
- Whisper transcription working locally
- Chunking sermons into embeddable pieces
- Clean `.jsonl` outputs for FAISS

---

## 🧼 What’s Next (May the Devs Be With Me)
- [x] RAG backend: Node.js ↔️ FastAPI ↔️ FAISS
- [x] Dynamic pastor responses
- [x] Ollama local model inference (bye OpenAI 👋)
- [x] Working chat UI with contextual memory
- [ ] `retry_failed.py` for broken YouTube links
<<<<<<< HEAD
- [ ] Structure/Re-organization and cleanup
- [ ] Translation for non-English sermons
- [ ] Add user feedback/rating system to improve responses
=======
- [ ] Structure re-organization and cleanup
- [ ] Loggin which model was used per query
- [ ] Switch between Local Instructor Model and OpenAI 
>>>>>>> dac14c6 (Memory Overflow fix)
- [ ] Message caching and storage

---

👨🏽‍💻 Built by a Dev-in-Faith ✝️ — powered by caffeine, Gospel, and the fear of breaking production.
