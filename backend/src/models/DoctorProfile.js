const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialite: { type: String, required: true },
    lieuExercice: { type: String },
    numeroOrdre: { type: String },
    disponibilites: [
      {
        jour: {
          type: String,
          enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
        },
        heureDebut: { type: String },
        heureFin: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
