const express = require('express');
const { body } = require('express-validator');
const { register, login, refreshAccessToken } = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/register',
  [
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('prenom').notEmpty().withMessage('Le prénom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('motDePasse')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('role').isIn(['patient', 'medecin']).withMessage('Rôle invalide'),
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('motDePasse').notEmpty().withMessage('Le mot de passe est requis'),
  ],
  validateRequest,
  login
);

router.post('/refresh', refreshAccessToken);

module.exports = router;
