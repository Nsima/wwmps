// services/embedder/embed.js
const { Configuration, OpenAIApi } = require("openai");
const axios = require("axios");

const LLM_PROVIDER = process.env.LLM_PROVIDER || "openai";

const embedText = async (text) => {
  if (LLM_PROVIDER === "local") {
    // Call local Python microservice on port 5000
    const response = await axios.post("http://localhost:5000/embed", { text });
    return response.data.embedding;
  } else {
    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data.data[0].embedding;
  }
};

module.exports = { embedText };
