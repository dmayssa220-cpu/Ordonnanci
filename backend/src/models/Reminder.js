const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    heure: { type: String, required: true },
    statut: {
      type: String,
      enum: ['a_venir', 'pris', 'oublie', 'reporte'],
      default: 'a_venir',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
