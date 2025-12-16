const express = require('express');
const {
  getUsersLeaderboard,
  getGymsLeaderboard,
  getChallengeLeaderboard,
  getUsersByChallengesCompleted,
  getUsersByBadges
} = require('../controllers/leaderboard.controller');

const router = express.Router();

// Routes publiques pour les classements
router.get('/users', getUsersLeaderboard);
router.get('/gyms', getGymsLeaderboard);
router.get('/challenges/:id', getChallengeLeaderboard);
router.get('/challenges-completed', getUsersByChallengesCompleted);
router.get('/badges', getUsersByBadges);

module.exports = router;
