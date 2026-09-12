const express = require('express');
const { getMyProfile, updateMyProfile } = require('../controllers/profile.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/me', verifyToken, getMyProfile);
router.put('/me', verifyToken, updateMyProfile);

module.exports = router;
