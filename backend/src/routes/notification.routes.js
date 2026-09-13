const express = require('express');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  updateNotificationPreferences,
} = require('../controllers/notification.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(verifyToken);

router.get('/', getMyNotifications);
router.patch('/lire-tout', markAllAsRead);
router.patch('/:id/lu', markAsRead);
router.put('/preferences', updateNotificationPreferences);

module.exports = router;
