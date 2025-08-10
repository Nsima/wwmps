// backend/services/searchService.js
const axios = require("axios");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DB_URL, // prefer single URL in prod
  // fallback to discrete envs only if needed:
  // user: process.env.PGUSER || "postgres",
  // host: process.env.PGHOST || "localhost",
  // database: process.env.PGDATABASE || "Chatbot",
  // password: process.env.PGPASSWORD || "password",
  // port: Number(process.env.PGPORT || 5432),
  // ssl: { rejectUnauthorized: false } // if using managed PG with SSL
});

const http = axios.create({
  baseURL: process.env.SEMSEARCH_URL || "http://localhost:8001",
  timeout: 20_000,
  // keep-alive helps if your FastAPI is on the same host
  httpAgent: undefined,
  httpsAgent: undefined,
});

/**
 * Semantic search for a given query within a specific index/corpus.
 * Returns ordered text chunks corresponding to the IDs returned by the vector search.
 */
async function semanticSearch(query, indexName, topK = 5) {
  try {
    const { data } = await http.post("/search", { query, top_k: topK, index: indexName });
    const chunkIds = data?.chunk_ids;
    const pastorSlugFromSvc = data?.pastor_slug;

    if (!Array.isArray(chunkIds) || chunkIds.length === 0) return [];

    const params = [chunkIds];
    let sql =
      "SELECT chunk, chunk_id FROM sermon_chunks WHERE chunk_id = ANY($1::text[])";

    // If your table contains multiple pastors’ chunks, keep this guard/filter.
    if (pastorSlugFromSvc) {
      sql += " AND pastor_slug = $2";
      params.push(pastorSlugFromSvc);
    }

    // Preserve search order using array_position
    sql += " ORDER BY array_position($1::text[], chunk_id::text)";

    const { rows } = await pool.query(sql, params);
    return rows.map((r) => r.chunk);
  } catch (err) {
    const detail = err?.response?.data || err?.message || err;
    console.error("Semantic search error:", detail);
    return [];
  }
}

module.exports = { semanticSearch };
