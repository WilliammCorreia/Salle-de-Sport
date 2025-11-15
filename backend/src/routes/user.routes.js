const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');

// Validation pour la mise a jour d'un utilisateur
const updateUserValidation = [
  body('firstName').optional().trim().notEmpty().withMessage('Le prénom ne peut pas être vide'),
  body('lastName').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('phone').optional().trim(),
  body('address').optional().isObject().withMessage("L'adresse doit être un objet"),
];

// Validation pour le changement de role
const updateRoleValidation = [
  body('role').isIn(['client', 'gym_owner', 'super_admin']).withMessage('Role invalide'),
];

// @route   GET /api/users
// @desc    Obtenir tous les utilisateurs (avec pagination et filtres)
// @access  Private/Admin
router.get('/', protect, authorize('super_admin'), userController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Obtenir un utilisateur par ID
// @access  Private/Admin
router.get('/:id', protect, authorize('super_admin'), userController.getUserById);

// @route   PUT /api/users/:id
// @desc    Mettre a jour un utilisateur
// @access  Private
router.put('/:id', protect, updateUserValidation, validate, userController.updateUser);

// @route   PUT /api/users/:id/deactivate
// @desc    Desactiver un utilisateur
// @access  Private/Admin
router.put('/:id/deactivate', protect, authorize('super_admin'), userController.deactivateUser);

// @route   PUT /api/users/:id/activate
// @desc    Reactiver un utilisateur
// @access  Private/Admin
router.put('/:id/activate', protect, authorize('super_admin'), userController.activateUser);

// @route   DELETE /api/users/:id
// @desc    Supprimer un utilisateur
// @access  Private/Admin
router.delete('/:id', protect, authorize('super_admin'), userController.deleteUser);

// @route   PUT /api/users/:id/role
// @desc    Changer le role d'un utilisateur
// @access  Private/Admin
router.put(
  '/:id/role',
  protect,
  authorize('super_admin'),
  updateRoleValidation,
  validate,
  userController.updateUserRole
);

// @route   GET /api/users/:id/stats
// @desc    Obtenir les statistiques d'un utilisateur
// @access  Private
router.get('/:id/stats', protect, userController.getUserStats);

module.exports = router;
