const mongoose = require('mongoose');

const referentielMedicamentSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, unique: true },
    dosagesDisponibles: [{ type: String }],
    interactionsConnues: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReferentielMedicament', referentielMedicamentSchema);
