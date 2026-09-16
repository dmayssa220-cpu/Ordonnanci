/*const express = require('express');
const { getMyProfile, updateMyProfile } = require('../controllers/profile.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/me', verifyToken, getMyProfile);
router.put('/me', verifyToken, updateMyProfile);

module.exports = router;*/
const express = require('express');
const {
  getMyProfile,
  updateMyProfile
} = require('../controllers/profile.controller');

const {
  verifyToken
} = require('../middleware/auth.middleware');

const router = express.Router();

// ========================================
// Désactiver le cache pour les données
// personnelles du profil
// ========================================
const noCache = (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};

// ========================================
// GET /api/profile/me
// Récupérer le profil de l'utilisateur connecté
// ========================================
router.get(
  '/me',
  verifyToken,
  noCache,
  getMyProfile
);

// ========================================
// PUT /api/profile/me
// Modifier le profil de l'utilisateur connecté
// ========================================
router.put(
  '/me',
  verifyToken,
  noCache,
  updateMyProfile
);

module.exports = router;
