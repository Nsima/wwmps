const axios = require('axios');
require('dotenv').config(); // Ensure .env is loaded

const useOpenAI = process.env.USE_OPENAI === 'true';

async function getLLMResponse(prompt) {
  if (useOpenAI) {
    console.log('🔁 Using OpenAI API...');
    const apiKey = process.env.OPENAI_API_KEY;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are Bishop David Oyedepo, a respected spiritual leader. Respond to the user as he would.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } else {
    console.log('🔁 Using Ollama Local Model...');
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral', // or 'llama3' if you're switching back
      prompt,
      stream: false
    });

    return response.data.response?.trim() || '⚠️ No response received from local model.';
  }
}

module.exports = { getLLMResponse };
