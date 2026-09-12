const express = require('express');
const { body } = require('express-validator');
const {
  createMedication,
  getMyMedications,
  getMedicationById,
  updateMedication,
  deleteMedication,
  getObservance,
} = require('../controllers/medication.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Toutes les routes ci-dessous nécessitent d'être connecté en tant que patient
router.use(verifyToken, checkRole('patient'));

router.post(
  '/',
  [
    body('nom').notEmpty().withMessage('Le nom du médicament est requis'),
    body('dosage').notEmpty().withMessage('Le dosage est requis'),
    body('frequence').notEmpty().withMessage('La fréquence est requise'),
    body('heuresPrise')
      .isArray({ min: 1 })
      .withMessage('heuresPrise doit être un tableau non vide, ex: ["08:00","20:00"]'),
    body('dateDebut').isISO8601().withMessage('dateDebut doit être une date valide (ISO 8601)'),
  ],
  validateRequest,
  createMedication
);

router.get('/', getMyMedications);
router.get('/:id', getMedicationById);
router.put('/:id', updateMedication);
router.delete('/:id', deleteMedication);
router.get('/:id/observance', getObservance);

module.exports = router;
