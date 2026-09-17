const express = require('express');
const {
  getMyProfile,
  updateMyProfile
} = require('../controllers/profile.controller');

const {
  verifyToken
} = require('../middleware/auth.middleware');

const router = express.Router();

const noCache = (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};
router.get(
  '/me',
  verifyToken,
  noCache,
  getMyProfile
);

router.put(
  '/me',
  verifyToken,
  noCache,
  updateMyProfile
);

module.exports = router;
