const express = require('express');
const { body } = require('express-validator');
const challengeInvitationController = require('../controllers/challengeInvitation.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');
const router = express.Router();

// Validation pour la mise a jour d'une invitation
const updateInvitationValidation = [
  body('status').isIn(['accepted', 'rejected']).withMessage('Statut invalide'),
];

// @route   PUT /api/invitations/:id/respond
// @desc    Mettre a jour le statut d'une invitation
// @access  Private (destinataire de l'invitation)
router.put(
  '/:id/respond',
  protect,
  updateInvitationValidation,
  validate,
  challengeInvitationController.respondToInvitation
);

module.exports = router;