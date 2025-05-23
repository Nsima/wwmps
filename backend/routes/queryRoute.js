// backend/routes/queryRoute.js
const express = require('express');
const router = express.Router();
const { getLLMResponseWithOllama } = require('../services/llmService');
const { semanticSearch } = require('../services/searchService');

router.post('/', async (req, res) => {
  const { question, pastor } = req.body;

  if (!question || !pastor) {
    return res.status(400).json({ error: 'Missing question or pastor in request body.' });
  }

  try {
    // Get top-k relevant chunks
    console.log("🔍 Performing semantic search...");
    const chunks = await semanticSearch(question);
    console.log("✅ Got chunks:", chunks.length);
    const context = chunks.join('\n\n');

    // Build prompt
    const prompt = `
Imagine you are ${pastor}, a respected spiritual leader. Based on the following sermon excerpts, provide a grounded response to the user's question.

Context:
${context}

User Question:
${question}

Respond as ${pastor} would:
`;
    console.log("🧠 Sending prompt to Ollama...");
    // Get LLM response from Ollama
    const answer = await getLLMResponseWithOllama(prompt);
    res.json({ answer });
  } catch (err) {
    console.error('Query processing error:', err);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

module.exports = router;
