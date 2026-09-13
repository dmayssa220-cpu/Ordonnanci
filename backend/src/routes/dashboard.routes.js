const express = require('express');
const { getPatientDashboard, getDoctorDashboard, exportHistoriquePDF } = require('../controllers/dashboard.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/patient', verifyToken, checkRole('patient'), getPatientDashboard);
router.get('/patient/export-pdf', verifyToken, checkRole('patient'), exportHistoriquePDF);
router.get('/medecin', verifyToken, checkRole('medecin'), getDoctorDashboard);

module.exports = router;
