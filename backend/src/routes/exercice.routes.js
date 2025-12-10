const express = require('express');
const { body } = require('express-validator');
const exercicesTypesController = require('../controllers/exercicesTypes.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');
const router = express.Router();

const ExercicesTypesValidation = [
    body('name').trim().notEmpty().withMessage('Le nom de l\'exercice est requis'),
    body('description').trim().notEmpty().withMessage('La description de l\'exercice est requise'),
    body('muscleGroups')
        .isArray({ min: 1 })
        .withMessage('Au moins un groupe musculaire est requis'),
];

// @route   GET /api/exercices-types
// @desc    Recuperer tous les types d'exercices avec pagination
// @access  Private (utilisateurs authentifiés)
router.get(
    "/",
    protect,
    exercicesTypesController.getAllExerciceTypes
);

// @route   GET /api/exercices-types/:id
// @desc    Recuperer un type d'exercice par ID
// @access  Private (utilisateurs authentifiés)
router.get(
    "/:id",
    protect,
    exercicesTypesController.getExerciceTypeById
)

// @route   POST /api/exercices-types
// @desc    Creer un nouveau type d'exercice
// @access  Private (super_admin)
router.post(
    "/",
    protect,
    authorize('super_admin'),
    ExercicesTypesValidation,
    validate,
    exercicesTypesController.createExerciceType
);

// @route   PUT /api/exercices-types/:id
// @desc    Mettre a jour un type d'exercice par ID
// @access  Private (super_admin)
router.put(
    "/:id",
    protect,
    authorize('super_admin'),
    ExercicesTypesValidation,
    validate,
    exercicesTypesController.updateExerciceType
)

// @route   DELETE /api/exercices-types/:id
// @desc    Supprimer un type d'exercice par ID
// @access  Private (super_admin)
router.delete(
    "/:id",
    protect,
    authorize('super_admin'),
    exercicesTypesController.deleteExerciceType
);

module.exports = router;