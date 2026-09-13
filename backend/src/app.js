const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/prescriptions', require('./routes/prescription.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

module.exports = app;
