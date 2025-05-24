// services/llm_inference/infer.js
const fetch = require("node-fetch");
const { Configuration, OpenAIApi } = require("openai");

const LLM_PROVIDER = process.env.LLM_PROVIDER || "openai";

const infer = async (messages) => {
  if (LLM_PROVIDER === "local") {
    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        messages,
      }),
    });
    const data = await res.json();
    return data.message.content;
  } else {
    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    const res = await openai.createChatCompletion({
      model: "gpt-4",
      messages,
    });
    return res.data.choices[0].message.content;
  }
};

module.exports = { infer };
