const express = require('express');
const {
  getBadges,
  getBadge,
  createBadge,
  updateBadge,
  deleteBadge,
  awardBadgeToUser,
  getUsersWithBadge
} = require('../controllers/badge.controller');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth.middleware');

// Routes publiques
router.get('/', getBadges);
router.get('/:id', getBadge);
router.get('/:id/users', getUsersWithBadge);

// Routes admin uniquement
router.use(protect);
router.use(authorize('super_admin'));

router.post('/', createBadge);
router.put('/:id', updateBadge);
router.delete('/:id', deleteBadge);
router.post('/:id/award/:userId', awardBadgeToUser);

module.exports = router;
