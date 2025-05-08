# 🛠️ Dev Diary — What Would My Pastor Say (WWMPS)

Welcome to my little back-end-of-the-frontend brain dump! This is where I’m keeping track of everything I’ve built, broken, re-built, and duct-taped together for this AI-powered chatbot.

## Caveat: I'm not the best at UI so most of this is basically ChatGPT
---

## 📅 Day 1: The Vision
Started with a simple idea: *"What would Pastor Oyedepo say if someone asked him this?"* That’s it. The goal? Let users ask questions and receive AI-generated reflections grounded in sermons and teachings from Nigerian pastors.

- Chose the stack: **Next.js + Tailwind + Node.js (Backend later) + OpenAI**
- Folder structure defined with `frontend/`, `backend/`, and `services/`
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

Looked good. Felt clean. Minimalism achieved.

---

## 🧪 Day 3: Chatbot Mode Activated
Shifted from a single response to full-on **chat mode**:
- Messages stack like a chat thread
- User on the right, Pastor on the left
- Added message list state + AI placeholder response

**Bonus:** Reflection changes dynamically when pastor or question changes.

---

## 🔄 Day 4: Dynamic Header
Made the header feel more human:
> "What would Pastor Oyedepo say?"

Changed automatically when a different pastor is selected. It just makes sense.

---

## 📱 Day 5: Mobile First (Fix the Input!)
On mobile, the input kept misbehaving — off-screen, blocked by keyboard, annoying as sin.
- Applied `sticky bottom-0` to input container
- Ensured chat window scrolls independently
- Used `100dvh` for better mobile viewport handling

Now it stays on screen. Hallelujah.

---

## 🧩 Day 6: Sidebar + Conversation Toggle
Sidebar was always visible. Not anymore.
- Sidebar defaults to hidden
- Toggle button in header: Show/Hide Conversations
- Smooth slide-in animation using `translate-x-0` / `-translate-x-full`

User can now focus on the conversation and reveal past chats on demand.

---

## 🧠 Day 7: Embedding Pipeline + FAISS + PostgreSQL Setup
Shifted from frontend to serious AI backend engineering:

- Created individual `.jsonl` files per pastor with sermon chunks
- Built a `services/embedder/` folder with:
  - `embed_faiss.py`: Embeds chunks using `text-embedding-ada-002`
  - `db.py`: Stores metadata to PostgreSQL (`embeddings_metadata`)
  - `config.py`: Loads OpenAI + DB credentials from `.env`
- Set up `.env` for OpenAI key + DB connection
- Generated separate FAISS index files per pastor (e.g., `index_oyedepo.faiss`)
- Modified pipeline to gracefully handle rate limits, SSL issues, and log skipped chunks

**Bonus:** Debugged OpenAI SSL issues on Windows + fixed SDK breaking changes by upgrading to the `openai>=1.0.0` client syntax.

---

## 🧼 Notes + Next Steps
- Need to build FAISS search + chunk retrieval logic
- Hook retrieval into GPT backend to form actual answers
- Add API layer with Node.js backend to connect frontend ↔ vector DB

Stay tuned — this app is turning sermons into divine UI.

— **Dev-in-faith** ✝️
