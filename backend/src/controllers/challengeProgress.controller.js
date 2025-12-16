const ChallengeProgress = require('../models/ChallengeProgress.model');
const Challenge = require('../models/Challenge.model');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Obtenir la progression d'un utilisateur pour un défi
// @route   GET /api/challenges/:challengeId/progress
// @access  Private
exports.getChallengeProgress = async (req, res, next) => {
  try {
    let progress = await ChallengeProgress.findOne({
      user: req.user.id,
      challenge: req.params.challengeId
    })
      .populate('challenge', 'title description difficulty duration')
      .populate('workouts');

    // Si pas de progression, créer une entrée par défaut
    if (!progress) {
      const challenge = await Challenge.findById(req.params.challengeId);
      if (!challenge) {
        return next(new ErrorResponse('Défi non trouvé', 404));
      }

      progress = await ChallengeProgress.create({
        user: req.user.id,
        challenge: req.params.challengeId,
        status: 'not_started',
        progression: 0
      });

      await progress.populate('challenge', 'title description difficulty duration');
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Démarrer un défi
// @route   POST /api/challenges/:challengeId/start
// @access  Private
exports.startChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) {
      return next(new ErrorResponse('Défi non trouvé', 404));
    }

    let progress = await ChallengeProgress.findOne({
      user: req.user.id,
      challenge: req.params.challengeId
    });

    if (progress) {
      if (progress.status === 'completed') {
        return next(new ErrorResponse('Ce défi est déjà complété', 400));
      }
      if (progress.status === 'in_progress') {
        return next(new ErrorResponse('Ce défi est déjà en cours', 400));
      }
    }

    if (!progress) {
      progress = new ChallengeProgress({
        user: req.user.id,
        challenge: req.params.challengeId
      });
    }

    progress.status = 'in_progress';
    progress.startDate = new Date();
    await progress.save();

    await progress.populate('challenge', 'title description difficulty duration');

    res.status(200).json({
      success: true,
      message: 'Défi démarré avec succès',
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour la progression d'un défi
// @route   PUT /api/challenges/:challengeId/progress
// @access  Private
exports.updateChallengeProgress = async (req, res, next) => {
  try {
    let progress = await ChallengeProgress.findOne({
      user: req.user.id,
      challenge: req.params.challengeId
    });

    if (!progress) {
      return next(new ErrorResponse('Progression non trouvée', 404));
    }

    const { progression, notes, workoutId } = req.body;

    if (progression !== undefined) {
      progress.progression = Math.min(100, Math.max(0, progression));
    }

    if (notes !== undefined) {
      progress.notes = notes;
    }

    if (workoutId && !progress.workouts.includes(workoutId)) {
      progress.workouts.push(workoutId);
    }

    await progress.save();
    await progress.populate(['challenge', 'workouts']);

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Marquer un défi comme complété
// @route   POST /api/challenges/:challengeId/complete
// @access  Private
exports.completeChallenge = async (req, res, next) => {
  try {
    let progress = await ChallengeProgress.findOne({
      user: req.user.id,
      challenge: req.params.challengeId
    });

    if (!progress) {
      return next(new ErrorResponse('Progression non trouvée', 404));
    }

    if (progress.status === 'completed') {
      return next(new ErrorResponse('Ce défi est déjà complété', 400));
    }

    progress.status = 'completed';
    progress.completionDate = new Date();
    progress.progression = 100;

    await progress.save();
    await progress.populate('challenge', 'title description difficulty');

    res.status(200).json({
      success: true,
      message: 'Félicitations ! Défi complété avec succès',
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Abandonner un défi
// @route   POST /api/challenges/:challengeId/abandon
// @access  Private
exports.abandonChallenge = async (req, res, next) => {
  try {
    let progress = await ChallengeProgress.findOne({
      user: req.user.id,
      challenge: req.params.challengeId
    });

    if (!progress) {
      return next(new ErrorResponse('Progression non trouvée', 404));
    }

    if (progress.status === 'completed') {
      return next(new ErrorResponse('Impossible d\'abandonner un défi complété', 400));
    }

    progress.status = 'abandoned';
    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Défi abandonné',
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir tous les défis en cours d'un utilisateur
// @route   GET /api/progress/my-challenges
// @access  Private
exports.getMyProgressChallenges = async (req, res, next) => {
  try {
    const { status } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;

    const progressList = await ChallengeProgress.find(query)
      .populate('challenge', 'title description difficulty duration category')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: progressList.length,
      data: progressList
    });
  } catch (error) {
    next(error);
  }
};
