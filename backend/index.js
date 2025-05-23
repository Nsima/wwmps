const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const queryRoute = require('./routes/queryRoute');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Route to handle AI question answering
app.use('/api/query', queryRoute);

app.listen(PORT, () => {
  console.log(`🚀 Node.js API running at http://localhost:${PORT}`);
});
