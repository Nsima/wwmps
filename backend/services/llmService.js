const axios = require('axios');

async function getLLMResponseWithOllama(prompt) {
  const response = await axios.post('http://localhost:11434/api/generate', {
    model: 'mannix/llama3.1-8b-abliterated', // or your custom model
    prompt,
    stream: false,
  });

  return response.data.response.trim() || 'No response received.';
}

module.exports = { getLLMResponseWithOllama };
