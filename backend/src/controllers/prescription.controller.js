const path = require('path');
const Prescription = require('../models/Prescription');
const Medication = require('../models/Medication');
const generateReminders = require('../utils/generateReminders');
const { pretraiterImage, extraireTexte, extraireMedicaments } = require('../services/prescriptionAnalyzer');

const uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image reçue (champ "ordonnance" requis)' });
    }

    const cheminImage = req.file.path;
    const cheminTraite = await pretraiterImage(cheminImage);
    const texteExtrait = await extraireTexte(cheminTraite);
    const medicamentsDetectes = extraireMedicaments(texteExtrait);

    const prescription = await Prescription.create({
      patientId: req.user.id,
      imageUrl: `/uploads/${path.basename(cheminImage)}`,
      texteExtrait,
      medicamentsDetectes,
      statutValidation: 'en_attente',
    });

    return res.status(201).json({
      message: 'Ordonnance analysée — merci de vérifier les médicaments détectés avant validation',
      prescription,
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'analyse de l'ordonnance", error: error.message });
  }
};

const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ prescriptions });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des ordonnances', error: error.message });
  }
};

const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, patientId: req.user.id });
    if (!prescription) return res.status(404).json({ message: 'Ordonnance introuvable' });
    return res.status(200).json({ prescription });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

/**
 * Validation manuelle par le patient (ou le médecin) : les médicaments
 * corrigés/confirmés sont transformés en vrais Medication + Reminder
 * (réutilise le pipeline de la Phase 3).
 */
const validatePrescription = async (req, res) => {
  try {
    const { medicamentsValides, corrige } = req.body;

    const prescription = await Prescription.findOne({ _id: req.params.id, patientId: req.user.id });
    if (!prescription) return res.status(404).json({ message: 'Ordonnance introuvable' });

    const medicamentsCrees = [];
    for (const med of medicamentsValides) {
      const dateFinEffective =
        med.dateFin || new Date(new Date(med.dateDebut).getTime() + 30 * 24 * 60 * 60 * 1000);

      const medicament = await Medication.create({
        patientId: req.user.id,
        nom: med.nom,
        dosage: med.dosage,
        frequence: med.frequence,
        dateDebut: med.dateDebut,
        dateFin: dateFinEffective,
        source: 'ia',
        prescriptionId: prescription._id,
      });

      await generateReminders(medicament._id, req.user.id, med.dateDebut, dateFinEffective, med.heuresPrise);
      medicamentsCrees.push(medicament);
    }

    prescription.statutValidation = corrige ? 'corrigee' : 'validee';
    prescription.medicamentsDetectes = medicamentsValides;
    await prescription.save();

    return res.status(200).json({
      message: 'Ordonnance validée : médicaments et rappels créés',
      prescription,
      medicamentsCrees,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la validation', error: error.message });
  }
};

module.exports = { uploadPrescription, getMyPrescriptions, getPrescriptionById, validatePrescription };
