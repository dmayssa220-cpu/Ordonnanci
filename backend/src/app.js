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
app.use('/api/medications', require('./routes/medication.routes'));
app.use('/api/reminders', require('./routes/reminder.routes'));
app.use('/api/doctors', require('./routes/doctor.routes'));
app.use('/api/appointments', require('./routes/appointment.routes'));

// Les routes des phases suivantes (reconnaissance d'ordonnances IA...)
// seront montées ici au fur et à mesure, par exemple :
// app.use('/api/prescriptions', require('./routes/prescription.routes'));

module.exports = app;
