const Medication = require('../models/Medication');
const Reminder = require('../models/Reminder');
const generateReminders = require('../utils/generateReminders');

const createMedication = async (req, res) => {
  try {
    const { nom, dosage, frequence, heuresPrise, dateDebut, dateFin } = req.body;

    // Si aucune date de fin n'est fournie, on prend par défaut un traitement de 30 jours
    const dateFinEffective =
      dateFin || new Date(new Date(dateDebut).getTime() + 30 * 24 * 60 * 60 * 1000);

    const medicament = await Medication.create({
      patientId: req.user.id,
      nom,
      dosage,
      frequence,
      dateDebut,
      dateFin: dateFinEffective,
      source: 'manuel',
    });

    await generateReminders(medicament._id, req.user.id, dateDebut, dateFinEffective, heuresPrise);

    return res.status(201).json({ message: 'Médicament ajouté et rappels générés', medicament });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'ajout du médicament", error: error.message });
  }
};

const getMyMedications = async (req, res) => {
  try {
    const medicaments = await Medication.find({ patientId: req.user.id }).sort({ dateDebut: -1 });
    return res.status(200).json({ medicaments });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des médicaments', error: error.message });
  }
};

const getMedicationById = async (req, res) => {
  try {
    const medicament = await Medication.findOne({ _id: req.params.id, patientId: req.user.id });
    if (!medicament) return res.status(404).json({ message: 'Médicament introuvable' });
    return res.status(200).json({ medicament });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération du médicament', error: error.message });
  }
};

const updateMedication = async (req, res) => {
  try {
    const medicament = await Medication.findOneAndUpdate(
      { _id: req.params.id, patientId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!medicament) return res.status(404).json({ message: 'Médicament introuvable' });
    return res.status(200).json({ message: 'Médicament mis à jour', medicament });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
};

const deleteMedication = async (req, res) => {
  try {
    const medicament = await Medication.findOneAndDelete({ _id: req.params.id, patientId: req.user.id });
    if (!medicament) return res.status(404).json({ message: 'Médicament introuvable' });
    await Reminder.deleteMany({ medicationId: medicament._id });
    return res.status(200).json({ message: 'Médicament et rappels associés supprimés' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
  }
};

const getObservance = async (req, res) => {
  try {
    const medicament = await Medication.findOne({ _id: req.params.id, patientId: req.user.id });
    if (!medicament) return res.status(404).json({ message: 'Médicament introuvable' });

    const maintenant = new Date();
    const rappelsEchus = await Reminder.find({ medicationId: medicament._id, date: { $lte: maintenant } });
    const totalEchus = rappelsEchus.length;
    const nombrePris = rappelsEchus.filter((r) => r.statut === 'pris').length;
    const tauxObservance = totalEchus > 0 ? Math.round((nombrePris / totalEchus) * 100) : null;

    return res.status(200).json({ medicationId: medicament._id, totalEchus, nombrePris, tauxObservance });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors du calcul de l'observance", error: error.message });
  }
};

module.exports = {
  createMedication,
  getMyMedications,
  getMedicationById,
  updateMedication,
  deleteMedication,
  getObservance,
};
