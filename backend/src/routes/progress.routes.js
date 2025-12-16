const express = require('express');
const { getMyProgressChallenges } = require('../controllers/challengeProgress.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// @route   GET /api/progress/my-challenges
// @desc    Obtenir tous les défis en cours de l'utilisateur
// @access  Private
router.get('/my-challenges', protect, getMyProgressChallenges);

module.exports = router;
