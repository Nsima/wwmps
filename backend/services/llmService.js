// services/llmService.js
const axios = require("axios");

/**
 * Self-hosted LLM generator for RAG.
 * Select provider via env:
 *   LLM_PROVIDER=ollama | llamacpp | vllm
 *   LLM_MODEL=llama3.1:8b-instruct-q4_K_M (ollama)
 *   OLLAMA_URL=http://127.0.0.1:11434
 *   LLAMACPP_URL=http://127.0.0.1:8080
 *   VLLM_BASE_URL=http://127.0.0.1:8000/v1   (OpenAI-compatible)
 */
const PROVIDER = (process.env.LLM_PROVIDER || "ollama").toLowerCase();
const MODEL = process.env.LLM_MODEL || "llama3.1:8b-instruct-q4_K_M";
const TIMEOUT = Number(process.env.LLM_TIMEOUT_MS || 60000);

// Unified entry
async function generateAnswer({ system, user, max_tokens = 512, temperature = 0.2 }) {
  if (PROVIDER === "llamacpp") return genWithLlamaCpp({ system, user, max_tokens, temperature });
  if (PROVIDER === "vllm") return genWithVLLM({ system, user, max_tokens, temperature });
  return genWithOllama({ system, user, max_tokens, temperature }); // default
}

// ----- OLLAMA (chat) -----
async function genWithOllama({ system, user, max_tokens, temperature }) {
  const baseURL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
  const { data } = await axios.post(
    `${baseURL}/api/chat`,
    {
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      stream: false,
      options: {
        temperature,
        num_predict: max_tokens,
        // RAG-friendly decoding:
        top_p: 0.9,
        repeat_penalty: 1.05,
        // If you enabled long context model:
        // num_ctx: 32768,
      },
    },
    { timeout: TIMEOUT }
  );
  return { text: data?.message?.content?.trim() || "" };
}

// ----- LLAMA.CPP server (OpenAI-ish / completions+chat bindings vary by build) -----
async function genWithLlamaCpp({ system, user, max_tokens, temperature }) {
  const baseURL = process.env.LLAMACPP_URL || "http://127.0.0.1:8080";
  // Most llama.cpp servers expose a /v1/chat/completions endpoint now.
  const { data } = await axios.post(
    `${baseURL}/v1/chat/completions`,
    {
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
      top_p: 0.9,
      max_tokens,
      // presence_penalty / frequency_penalty may or may not be supported depending on build
    },
    { timeout: TIMEOUT }
  );
  const text = data?.choices?.[0]?.message?.content?.trim() || "";
  return { text };
}

// ----- vLLM (OpenAI-compatible) -----
async function genWithVLLM({ system, user, max_tokens, temperature }) {
  const baseURL = process.env.VLLM_BASE_URL || "http://127.0.0.1:8000/v1";
  const api = axios.create({
    baseURL,
    timeout: TIMEOUT,
    headers: { Authorization: `Bearer ${process.env.VLLM_API_KEY || "no-key"}` },
  });

  const model = MODEL || "meta-llama/Meta-Llama-3.1-8B-Instruct";
  const { data } = await api.post("/chat/completions", {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature,
    top_p: 0.9,
    max_tokens,
  });

  const text = data?.choices?.[0]?.message?.content?.trim() || "";
  return { text };
}

module.exports = { generateAnswer };
