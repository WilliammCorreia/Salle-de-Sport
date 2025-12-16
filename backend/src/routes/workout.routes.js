const express = require('express');
const {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats
} = require('../controllers/workout.controller');

const router = express.Router();

const { protect } = require('../middleware/auth.middleware');

// Toutes les routes nécessitent une authentification
router.use(protect);

router.route('/').get(getWorkouts).post(createWorkout);

router.get('/stats/summary', getWorkoutStats);

router.route('/:id').get(getWorkout).put(updateWorkout).delete(deleteWorkout);

module.exports = router;
