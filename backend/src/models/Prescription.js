const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medecinId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    imageUrl: { type: String, required: true },
    texteExtrait: { type: String },
    medicamentsDetectes: [
      {
        nom: String,
        dosage: String,
        frequence: String,
      },
    ],
    statutValidation: {
      type: String,
      enum: ['en_attente', 'validee', 'corrigee'],
      default: 'en_attente',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
