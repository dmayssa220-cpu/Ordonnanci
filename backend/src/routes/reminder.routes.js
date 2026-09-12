const express = require('express');
const { body } = require('express-validator');
const { getMyReminders, updateReminderStatus } = require('../controllers/reminder.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(verifyToken, checkRole('patient'));

router.get('/', getMyReminders);

router.patch(
  '/:id/statut',
  [body('statut').isIn(['pris', 'oublie', 'reporte']).withMessage('Statut invalide')],
  validateRequest,
  updateReminderStatus
);

module.exports = router;
