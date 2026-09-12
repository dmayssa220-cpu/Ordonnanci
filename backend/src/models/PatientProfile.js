const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dateNaissance: { type: Date },
    genre: { type: String, enum: ['homme', 'femme', 'autre'] },
    antecedents: [{ type: String }],
    allergies: [{ type: String }],
    medecinTraitantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
