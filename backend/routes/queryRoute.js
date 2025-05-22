// backend/routes/queryRoute.js
const express = require('express');
const router = express.Router();
const { getLLMResponseWithOllama } = require('../services/llmService');
const { semanticSearch } = require('../services/searchService');

router.post('/query', async (req, res) => {
  const { question } = req.body;

  try {
    const chunks = await semanticSearch(question); // Top-k relevant chunks
    const context = chunks.join('\n\n');

    const prompt = `
You are a helpful assistant. Use the following context to answer the question.

Context:
${context}

Question:
${question}

Answer:
`;

    const answer = await getLLMResponseWithOllama(prompt);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

module.exports = router;
