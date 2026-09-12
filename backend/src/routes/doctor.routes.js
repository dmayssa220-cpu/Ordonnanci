const express = require('express');
const { searchDoctors, getAvailableSlots } = require('../controllers/doctor.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Consultable par les patients comme par les médecins connectés
router.use(verifyToken);

router.get('/', searchDoctors);
router.get('/:id/creneaux', getAvailableSlots);

module.exports = router;
