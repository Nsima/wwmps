// backend/routes/queryRoute.js
const express = require("express");
const router = express.Router();
const { getLLMResponse } = require("../services/llmService");
const { semanticSearch } = require("../services/searchService");

const PASTOR_MAP = {
  oyedepo:    { name: "Bishop David Oyedepo",   index: "vectordb-oyedepo" },
  adeboye:    { name: "Pastor Enoch Adeboye",   index: "vectordb-adeboye" },
  adefarasin: { name: "Pastor Paul Adefarasin", index: "vectordb-adefarasin" },
  ibiyeomie:  { name: "Pastor David Ibiyeomie", index: "vectordb-ibiyeomie" },
};

function normalizeSlug(input = "") {
  return String(input).trim().toLowerCase().replace(/^(bishop|pastor)\s+/g, "").replace(/[^\w]+/g, "");
}

router.post("/", async (req, res) => {
  const { question, pastor } = req.body || {};
  if (!question || !pastor) {
    return res.status(400).json({ error: "Missing question or pastor in request body." });
  }

  const slug = PASTOR_MAP[pastor] ? pastor : normalizeSlug(pastor);
  const target = PASTOR_MAP[slug] || PASTOR_MAP.oyedepo;

  try {
    console.log(`🔎 semanticSearch → index=${target.index}, pastor=${target.name}`);
    const chunks = await semanticSearch(question, target.index, 6);
    const context = (chunks || []).join("\n\n").slice(0, 3000);

    const safeContext =
      context ||
      "No directly relevant excerpts were found. Be general, conservative, and avoid fabricating specifics.";

    const prompt = `
You are to answer in the style and pastoral emphasis of ${target.name}, a respected spiritual leader.
Ground your answer in the provided sermon excerpts when possible. If not available, be conservative and avoid inventing details.

Context (sermon excerpts):
${safeContext}

User Question:
${question}

Instructions:
- Tone: pastoral, compassionate, biblically grounded.
- If excerpts don't cover the topic, say so briefly before offering a general pastoral perspective.
- Be concise (6–10 sentences), avoid sensational claims, and do not fabricate quotes.
- Close with a short scripture reference where appropriate.
`;

    console.log("🧠 Sending prompt to LLM…");
    const answer = await getLLMResponse(prompt);
    return res.json({ answer, pastor: { slug, name: target.name } });
  } catch (err) {
    console.error("Query processing error:", err);
    return res.status(500).json({ error: "Failed to process query" });
  }
});

module.exports = router;
