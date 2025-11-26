const express = require('express');
const { body } = require('express-validator');
const challengeController = require('../controllers/challenge.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');
const router = express.Router();

const ChallengeValidation = [
    body('title').trim().notEmpty().withMessage('Le titre du défi est requis'),
    body('description').trim().notEmpty().withMessage('La description du défi est requise'),
    body('gymHall').optional().isMongoId().withMessage("ID de la salle de sport invalide"),
    body('category').isIn(['perte_poids', 'prise_masse', 'endurance', 'force', 'souplesse', 'autre']),
    body('difficulty').optional().isIn(['débutant', 'intermédiaire', 'avancé', 'expert']),
    body('duration').isInt({ min: 1 }).withMessage('La durée doit être un entier supérieur à 0'),
    body('durationUnit').optional().isIn(['jours', 'semaines']),
    body('exercises').isArray({ min: 1 }).withMessage('Au moins un exercice est requis'),
    body('exercises.*.exerciseType').isMongoId().withMessage("ID de type d'exercice invalide"),
    body('exercises.*.sets').optional().isInt({ min: 1 }).withMessage('Le nombre de séries doit être un entier supérieur à 0'),
    body('exercises.*.reps').optional().isInt({ min: 1 }).withMessage('Le nombre de répétitions doit être un entier supérieur à 0'),
    body('exercises.*.restTime').optional().isInt({ min: 0 }).withMessage('Le temps de repos doit être un entier positif'),
    body('participants').optional().isArray(),
    body('participants.*').isMongoId().withMessage("ID de participant invalide"),
    body('isActive').optional().isBoolean(),
];

// @route   POST /api/challenges
// @desc    Creer un nouveau défi
// @access  Private (utilisateurs authentifiés)
router.post(
    "/",
    protect,
    ChallengeValidation,
    validate,
    challengeController.createChallenge
);

module.exports = router;