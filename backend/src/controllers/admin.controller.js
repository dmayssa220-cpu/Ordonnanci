const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const ReferentielMedicament = require('../models/ReferentielMedicament');

const listUsers = async (req, res) => {
  try {
    const utilisateurs = await User.find().select('-motDePasseHash');
    return res.status(200).json({ utilisateurs });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const utilisateur = await User.findById(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable' });

    utilisateur.estActif = !utilisateur.estActif;
    await utilisateur.save();

    return res.status(200).json({
      message: `Compte ${utilisateur.estActif ? 'réactivé' : 'suspendu'}`,
      utilisateur,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const utilisateur = await User.findByIdAndDelete(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable' });

    await PatientProfile.deleteOne({ userId: utilisateur._id });
    await DoctorProfile.deleteOne({ userId: utilisateur._id });

    return res.status(200).json({ message: 'Compte supprimé' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

const listReferentiel = async (req, res) => {
  try {
    const medicaments = await ReferentielMedicament.find().sort({ nom: 1 });
    return res.status(200).json({ medicaments });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

const createReferentiel = async (req, res) => {
  try {
    const { nom, dosagesDisponibles, interactionsConnues } = req.body;
    const existant = await ReferentielMedicament.findOne({ nom });
    if (existant) return res.status(409).json({ message: 'Ce médicament existe déjà dans le référentiel' });

    const medicament = await ReferentielMedicament.create({ nom, dosagesDisponibles, interactionsConnues });
    return res.status(201).json({ message: 'Médicament ajouté au référentiel', medicament });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

const updateReferentiel = async (req, res) => {
  try {
    const medicament = await ReferentielMedicament.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!medicament) return res.status(404).json({ message: 'Médicament introuvable dans le référentiel' });
    return res.status(200).json({ message: 'Référentiel mis à jour', medicament });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

const deleteReferentiel = async (req, res) => {
  try {
    const medicament = await ReferentielMedicament.findByIdAndDelete(req.params.id);
    if (!medicament) return res.status(404).json({ message: 'Médicament introuvable dans le référentiel' });
    return res.status(200).json({ message: 'Médicament retiré du référentiel' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

const getStatistiques = async (req, res) => {
  try {
    const nombrePatients = await User.countDocuments({ role: 'patient' });
    const nombreMedecins = await User.countDocuments({ role: 'medecin' });
    const nombreComptesActifs = await User.countDocuments({ estActif: true });

    const nombrePrescriptions = await Prescription.countDocuments();
    const prescriptionsValidees = await Prescription.countDocuments({ statutValidation: 'validee' });
    const prescriptionsCorrigees = await Prescription.countDocuments({ statutValidation: 'corrigee' });
    const tauxReussiteOCR =
      nombrePrescriptions > 0 ? Math.round((prescriptionsValidees / nombrePrescriptions) * 100) : null;

    const nombreRendezVous = await Appointment.countDocuments();

    return res.status(200).json({
      utilisateurs: { nombrePatients, nombreMedecins, nombreComptesActifs },
      prescriptions: { nombrePrescriptions, prescriptionsValidees, prescriptionsCorrigees, tauxReussiteOCR },
      nombreRendezVous,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du calcul des statistiques', error: error.message });
  }
};

module.exports = {
  listUsers,
  toggleUserStatus,
  deleteUser,
  listReferentiel,
  createReferentiel,
  updateReferentiel,
  deleteReferentiel,
  getStatistiques,
};
