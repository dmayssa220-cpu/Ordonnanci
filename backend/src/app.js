const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Route de vérification de santé de l'API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Odonnanci API opérationnelle' });
});


module.exports = app;
