const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');

// Validation pour l'inscription
const registerValidation = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
  body('role').optional().isIn(['client', 'gym_owner', 'super_admin']).withMessage('Role invalide'),
];

// Validation pour la connexion
const loginValidation = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
];

// Validation pour le changement de mot de passe
const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
];

// @route   POST /api/auth/register
// @desc    Inscription d'un nouvel utilisateur
// @access  Public
router.post('/register', registerValidation, validate, authController.register);

// @route   POST /api/auth/login
// @desc    Connexion d'un utilisateur
// @access  Public
router.post('/login', loginValidation, validate, authController.login);

// @route   GET /api/auth/me
// @desc    Obtenir le profil de l'utilisateur connecte
// @access  Private
router.get('/me', protect, authController.getMe);

// @route   PUT /api/auth/update-password
// @desc    Mettre a jour le mot de passe
// @access  Private
router.put(
  '/update-password',
  protect,
  updatePasswordValidation,
  validate,
  authController.updatePassword
);

module.exports = router;
