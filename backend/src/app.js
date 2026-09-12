const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Route de vérification de santé de l'API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Odonnanci API opérationnelle' });
});

// Routes métier
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Les routes des phases suivantes (médicaments, RDV, ordonnances...)
// seront montées ici au fur et à mesure, par exemple :
// app.use('/api/medications', require('./routes/medication.routes'));

module.exports = app;
