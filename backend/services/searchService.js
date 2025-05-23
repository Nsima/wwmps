const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Chatbot',
  password: 'password',
  port: 5432,
});

async function semanticSearch(query, topK = 5) {
  try {
    // Step 1: Send query to FastAPI semantic search
    const res = await axios.post('http://localhost:8001/search', {
      query,
      top_k: topK
    });

    const chunkIds = res.data.chunk_ids;

    if (!chunkIds || chunkIds.length === 0) {
      return [];
    }

    // Step 2: Retrieve actual text chunks from Postgres
    const { rows } = await pool.query(
      'SELECT chunk FROM sermon_chunks WHERE chunk_id = ANY($1)',
      [chunkIds]
    );

    return rows.map(r => r.chunk);
  } catch (err) {
    console.error('Semantic search error:', err);
    return [];
  }
}

module.exports = { semanticSearch };
