const express = require('express');
const { body } = require('express-validator');
const {
  createAppointment,
  getMyAppointments,
  getUpcomingAppointmentAlerts,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
} = require('../controllers/appointment.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(verifyToken);

const validationCreneau = [
  body('date').isISO8601().withMessage('date doit être au format YYYY-MM-DD'),
  body('heure')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('heure doit être au format HH:mm'),
];

router.post(
  '/',
  checkRole('patient'),
  [body('medecinId').notEmpty().withMessage('medecinId est requis'), ...validationCreneau],
  validateRequest,
  createAppointment
);

// Liste des RDV de l'utilisateur connecté (patient ou médecin selon son rôle)
router.get('/', getMyAppointments);

// RDV dans les prochaines 24h / 1h, pour affichage de rappels côté app
router.get('/alertes', getUpcomingAppointmentAlerts);

router.patch('/:id/annuler', cancelAppointment); // patient ou médecin concerné

router.patch('/:id/reporter', checkRole('patient'), validationCreneau, validateRequest, rescheduleAppointment);

router.patch('/:id/terminer', checkRole('medecin'), completeAppointment);

module.exports = router;
