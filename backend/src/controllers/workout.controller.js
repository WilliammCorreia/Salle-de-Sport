const Workout = require('../models/Workout.model');
const User = require('../models/User.model');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Obtenir toutes les séances d'un utilisateur
// @route   GET /api/workouts
// @access  Private
exports.getWorkouts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, challenge, startDate, endDate, intensity } = req.query;

    const query = { user: req.user.id };

    if (challenge) query.challenge = challenge;
    if (intensity) query.intensity = intensity;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const workouts = await Workout.find(query)
      .populate('challenge', 'title difficulty')
      .populate('gymHall', 'name')
      .populate('exercises.exerciseType', 'name muscleGroups')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const count = await Workout.countDocuments(query);

    res.status(200).json({
      success: true,
      count: workouts.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: workouts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir une séance par ID
// @route   GET /api/workouts/:id
// @access  Private
exports.getWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('challenge', 'title difficulty')
      .populate('gymHall', 'name address')
      .populate('exercises.exerciseType', 'name description muscleGroups');

    if (!workout) {
      return next(new ErrorResponse('Séance non trouvée', 404));
    }

    // Vérifier que l'utilisateur a accès à cette séance
    if (workout.user.toString() !== req.user.id && req.user.role !== 'super_admin') {
      return next(new ErrorResponse('Non autorisé à accéder à cette séance', 403));
    }

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enregistrer une nouvelle séance
// @route   POST /api/workouts
// @access  Private
exports.createWorkout = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const workout = await Workout.create(req.body);

    await workout.populate([
      { path: 'challenge', select: 'title difficulty' },
      { path: 'gymHall', select: 'name' },
      { path: 'exercises.exerciseType', select: 'name muscleGroups' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Séance enregistrée avec succès',
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour une séance
// @route   PUT /api/workouts/:id
// @access  Private
exports.updateWorkout = async (req, res, next) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return next(new ErrorResponse('Séance non trouvée', 404));
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (workout.user.toString() !== req.user.id && req.user.role !== 'super_admin') {
      return next(new ErrorResponse('Non autorisé à modifier cette séance', 403));
    }

    // Empêcher la modification de l'utilisateur
    delete req.body.user;

    workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'challenge', select: 'title difficulty' },
      { path: 'gymHall', select: 'name' },
      { path: 'exercises.exerciseType', select: 'name muscleGroups' }
    ]);

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer une séance
// @route   DELETE /api/workouts/:id
// @access  Private
exports.deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return next(new ErrorResponse('Séance non trouvée', 404));
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (workout.user.toString() !== req.user.id && req.user.role !== 'super_admin') {
      return next(new ErrorResponse('Non autorisé à supprimer cette séance', 403));
    }

    await workout.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques des séances
// @route   GET /api/workouts/stats/summary
// @access  Private
exports.getWorkoutStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = { user: req.user.id };
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const stats = await Workout.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$calories' },
          avgDuration: { $avg: '$duration' },
          avgCalories: { $avg: '$calories' }
        }
      }
    ]);

    // Statistiques par intensité
    const intensityStats = await Workout.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$intensity',
          count: { $sum: 1 }
        }
      }
    ]);

    // Statistiques par mois
    const monthlyStats = await Workout.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 },
          totalCalories: { $sum: '$calories' },
          totalDuration: { $sum: '$duration' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || {
          totalWorkouts: 0,
          totalDuration: 0,
          totalCalories: 0,
          avgDuration: 0,
          avgCalories: 0
        },
        byIntensity: intensityStats,
        byMonth: monthlyStats
      }
    });
  } catch (error) {
    next(error);
  }
};
