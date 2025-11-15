const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const gymHallController = require('../controllers/gymHall.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');

// Validation pour la creation/mise a jour d'une salle
const gymHallValidation = [
  body('name').optional().trim().notEmpty().withMessage('Le nom de la salle est requis'),
  body('description').optional().trim().notEmpty().withMessage('La description est requise'),
  body('address').optional().isObject().withMessage("L'adresse doit être un objet"),
  body('address.street').optional().trim().notEmpty().withMessage('La rue est requise'),
  body('address.city').optional().trim().notEmpty().withMessage('La ville est requise'),
  body('address.postalCode').optional().trim().notEmpty().withMessage('Le code postal est requis'),
  body('contact')
    .optional()
    .isObject()
    .withMessage('Les informations de contact doivent être un objet'),
  body('contact.email').optional().isEmail().withMessage('Email de contact invalide'),
  body('contact.phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Le téléphone de contact est requis'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacité doit être un nombre positif'),
  body('equipment').optional().isArray().withMessage('Les équipements doivent être un tableau'),
  body('facilities').optional().isArray().withMessage('Les installations doivent être un tableau'),
  body('activityTypes')
    .optional()
    .isArray()
    .withMessage("Les types d'activités doivent être un tableau"),
];

// @route   POST /api/gym-halls
// @desc    Creer une nouvelle salle de sport
// @access  Private (gym_owner ou super_admin)
router.post(
  '/',
  protect,
  authorize('gym_owner', 'super_admin'),
  gymHallValidation,
  validate,
  gymHallController.createGymHall
);

// @route   GET /api/gym-halls
// @desc    Obtenir toutes les salles de sport (avec pagination et filtres)
// @access  Public (avec auth optionnelle pour voir les salles non approuvees si admin)
router.get('/', optionalAuth, gymHallController.getAllGymHalls);

// @route   GET /api/gym-halls/:id
// @desc    Obtenir une salle de sport par ID
// @access  Public (avec auth optionnelle)
router.get('/:id', optionalAuth, gymHallController.getGymHallById);

// @route   PUT /api/gym-halls/:id
// @desc    Mettre a jour une salle de sport
// @access  Private (owner ou super_admin)
router.put('/:id', protect, gymHallValidation, validate, gymHallController.updateGymHall);

// @route   DELETE /api/gym-halls/:id
// @desc    Supprimer une salle de sport
// @access  Private (owner ou super_admin)
router.delete('/:id', protect, gymHallController.deleteGymHall);

// @route   PUT /api/gym-halls/:id/approve
// @desc    Approuver une salle de sport
// @access  Private/Admin
router.put('/:id/approve', protect, authorize('super_admin'), gymHallController.approveGymHall);

// @route   PUT /api/gym-halls/:id/reject
// @desc    Rejeter une salle de sport
// @access  Private/Admin
router.put('/:id/reject', protect, authorize('super_admin'), gymHallController.rejectGymHall);

// @route   PUT /api/gym-halls/:id/suspend
// @desc    Suspendre une salle de sport
// @access  Private/Admin
router.put('/:id/suspend', protect, authorize('super_admin'), gymHallController.suspendGymHall);

module.exports = router;
