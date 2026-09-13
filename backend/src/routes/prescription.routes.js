const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  uploadPrescription,
  getMyPrescriptions,
  getPrescriptionById,
  validatePrescription,
} = require('../controllers/prescription.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

const router = express.Router();

const stockage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage: stockage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max
  fileFilter: (req, file, cb) => {
    const typesAcceptes = /jpeg|jpg|png/;
    if (typesAcceptes.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images JPEG/PNG sont acceptées'));
    }
  },
});

router.use(verifyToken, checkRole('patient'));

router.post('/', upload.single('ordonnance'), uploadPrescription);
router.get('/', getMyPrescriptions);
router.get('/:id', getPrescriptionById);
router.post('/:id/valider', validatePrescription);

module.exports = router;
