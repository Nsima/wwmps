// backend/controllers/askController.js
const { Pool } = require("pg");
const { semanticSearch } = require("../services/searchService");
const { generateAnswer } = require("../services/llmService"); // <-- true generator
const pool = new Pool({ connectionString: process.env.DB_URL || process.env.DATABASE_URL });

/**
 * POST /ask
 * body: { query: string, pastor: string, topK?: number, session_id?: string, user_id?: string|null }
 */
exports.ask = async (req, res) => {
  const t0 = Date.now();
  const { query, pastor, topK = 5, session_id = null, user_id = null } = req.body || {};

  if (!query || !pastor) {
    return res.status(400).json({ error: "query and pastor are required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Record the incoming question immediately
    const insertQuerySql = `
      INSERT INTO user_queries (user_id, session_id, pastor_slug, query_text)
      VALUES ($1,$2,$3,$4)
      RETURNING id, created_at
    `;
    const { rows: uqRows } = await client.query(insertQuerySql, [user_id, session_id, pastor, query]);
    const user_query_id = uqRows[0].id;

    // 2) Retrieve context from vector search
    const results = await semanticSearch(query, pastor, topK);
    // results: [{ chunk_id, chunk, title, source_url, transcription_date, pastor_slug, score }...]

    // 3) Build a grounded prompt for the LLM
    const contextBlocks = results.map((r, i) => 
      `[[${i+1}]] (${r.pastor_slug}) ${r.title || "Untitled"} — ${r.transcription_date || "n.d."}\n${r.chunk}`
    ).join("\n\n");

    const system = `You are "What Would My Pastor Say". 
Only answer using the context. If the answer isn’t covered by the context, say you’re not sure and suggest asking a more specific question.
Keep the pastoral tone faithful to ${pastor}. Cite using [1], [2]... corresponding to the context entries.`;

    const user = `Question: ${query}\n\nContext:\n${contextBlocks}`;

    // 4) Generate the answer (true LLM: OpenAI/Ollama/etc.)
    const gen = await generateAnswer({ system, user });
    const latency_ms = Date.now() - t0;

    // 5) Persist the final response with citations & chunks
    const citations = results.map((r, i) => ({
      ref: i + 1,
      chunk_id: r.chunk_id,
      title: r.title,
      source_url: r.source_url,
      transcription_date: r.transcription_date,
      pastor_slug: r.pastor_slug,
      score: r.score,
    }));

    const insertRespSql = `
      INSERT INTO chat_responses
        (user_query_id, response_text, model_id, citations, top_chunks, latency_ms)
      VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6)
      RETURNING id, created_at
    `;
    const model_id = process.env.GENERATION_MODEL_ID || "local-llm";
    const top_chunks = citations; // store same payload, or include the raw chunk text if you prefer

    const { rows: crRows } = await client.query(insertRespSql, [
      user_query_id,
      gen.text,
      model_id,
      JSON.stringify(citations),
      JSON.stringify(top_chunks),
      latency_ms,
    ]);

    await client.query("COMMIT");

    return res.json({
      user_query_id,
      response_id: crRows[0].id,
      answer: gen.text,
      citations, // for UI
      latency_ms,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ask error:", err);
    return res.status(500).json({ error: "Internal error" });
  } finally {
    client.release();
  }
};
