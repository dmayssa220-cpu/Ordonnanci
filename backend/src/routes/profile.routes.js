const express = require('express');
const multer = require('multer');
const path = require('path');
const { getMyProfile, updateMyProfile, uploadAvatar } = require('../controllers/profile.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

const noCache = (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};

const stockageAvatar = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`),
});

const uploadAvatarMiddleware = multer({
  storage: stockageAvatar,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max pour un avatar
  fileFilter: (req, file, cb) => {
    const typesAcceptes = /jpeg|jpg|png/;
    if (typesAcceptes.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images JPEG/PNG sont acceptées'));
    }
  },
});

router.get('/me', verifyToken, noCache, getMyProfile);
router.put('/me', verifyToken, noCache, updateMyProfile);
router.post('/avatar', verifyToken, uploadAvatarMiddleware.single('avatar'), uploadAvatar);

module.exports = router;
