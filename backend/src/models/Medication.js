const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nom: { type: String, required: true },
    dosage: { type: String, required: true },
    frequence: { type: String, required: true }, // ex : "3 fois par jour"
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date },
    source: { type: String, enum: ['manuel', 'ia'], default: 'manuel' },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medication', medicationSchema);
