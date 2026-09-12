const express = require('express');
const { listUsers } = require('../controllers/admin.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/users', verifyToken, checkRole('admin'), listUsers);

module.exports = router;
