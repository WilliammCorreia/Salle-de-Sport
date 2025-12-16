const User = require('../models/User.model');
const GymHall = require('../models/GymHall.model');
const ChallengeProgress = require('../models/ChallengeProgress.model');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Classement des utilisateurs par score
// @route   GET /api/leaderboard/users
// @access  Public
exports.getUsersLeaderboard = async (req, res, next) => {
  try {
    const { limit = 50, role } = req.query;

    const query = { isActive: true };
    if (role) query.role = role;

    const users = await User.find(query)
      .select('firstName lastName email role stats.score stats.completedChallenges stats.totalWorkouts stats.badges')
      .sort({ 'stats.score': -1 })
      .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      score: user.stats.score || 0,
      completedChallenges: user.stats.completedChallenges || 0,
      totalWorkouts: user.stats.totalWorkouts || 0,
      badgesCount: user.stats.badges?.length || 0
    }));

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Classement des salles de sport
// @route   GET /api/leaderboard/gyms
// @access  Public
exports.getGymsLeaderboard = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const gyms = await GymHall.find({ status: 'approved', isActive: true })
      .populate('owner', 'firstName lastName')
      .select('name city proposedChallenges rating')
      .lean();

    // Calculer le score de chaque salle
    const gymsWithScore = await Promise.all(
      gyms.map(async (gym) => {
        // Nombre de défis proposés
        const challengesCount = gym.proposedChallenges?.length || 0;

        // Nombre de participants aux défis de la salle
        const Challenge = require('../models/Challenge.model');
        const challenges = await Challenge.find({
          gymHall: gym._id
        }).select('participants');

        const totalParticipants = challenges.reduce(
          (sum, challenge) => sum + (challenge.participants?.length || 0),
          0
        );

        // Calcul du score: défis + participants + note
        const score = challengesCount * 10 + totalParticipants * 2 + (gym.rating?.average || 0) * 5;

        return {
          gymId: gym._id,
          name: gym.name,
          city: gym.city,
          owner: gym.owner ? `${gym.owner.firstName} ${gym.owner.lastName}` : 'N/A',
          challengesCount,
          totalParticipants,
          rating: gym.rating?.average || 0,
          score: Math.round(score)
        };
      })
    );

    // Trier par score et limiter
    gymsWithScore.sort((a, b) => b.score - a.score);
    const topGyms = gymsWithScore.slice(0, parseInt(limit));

    // Ajouter le rang
    const leaderboard = topGyms.map((gym, index) => ({
      rank: index + 1,
      ...gym
    }));

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Classement pour un défi spécifique
// @route   GET /api/leaderboard/challenges/:id
// @access  Public
exports.getChallengeLeaderboard = async (req, res, next) => {
  try {
    const challengeId = req.params.id;

    const progressList = await ChallengeProgress.find({
      challenge: challengeId,
      status: { $in: ['in_progress', 'completed'] }
    })
      .populate('user', 'firstName lastName email')
      .populate('challenge', 'title')
      .lean();

    const leaderboard = progressList
      .map((progress, index) => {
        // Calculer le score basé sur la progression et le temps
        let score = progress.progression || 0;

        if (progress.status === 'completed' && progress.completionDate) {
          const duration = progress.completionDate - progress.startDate;
          const daysToComplete = Math.ceil(duration / (1000 * 60 * 60 * 24));
          // Bonus pour complétion rapide
          score += Math.max(0, 100 - daysToComplete);
        }

        return {
          userId: progress.user._id,
          name: `${progress.user.firstName} ${progress.user.lastName}`,
          email: progress.user.email,
          status: progress.status,
          progression: progress.progression,
          workoutsCount: progress.workouts?.length || 0,
          startDate: progress.startDate,
          completionDate: progress.completionDate,
          score: Math.round(score)
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({
        rank: index + 1,
        ...item
      }));

    res.status(200).json({
      success: true,
      challengeId,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Classement des utilisateurs par défis complétés
// @route   GET /api/leaderboard/challenges-completed
// @access  Public
exports.getUsersByChallengesCompleted = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const users = await User.find({ isActive: true })
      .select('firstName lastName email stats.completedChallenges stats.score')
      .sort({ 'stats.completedChallenges': -1 })
      .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      completedChallenges: user.stats.completedChallenges || 0,
      score: user.stats.score || 0
    }));

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Classement des utilisateurs par nombre de badges
// @route   GET /api/leaderboard/badges
// @access  Public
exports.getUsersByBadges = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const users = await User.find({ isActive: true })
      .select('firstName lastName email stats.badges stats.score');

    const usersWithBadgeCount = users
      .map(user => ({
        userId: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        badgesCount: user.stats.badges?.length || 0,
        badges: user.stats.badges || [],
        score: user.stats.score || 0
      }))
      .sort((a, b) => b.badgesCount - a.badgesCount)
      .slice(0, parseInt(limit))
      .map((user, index) => ({
        rank: index + 1,
        ...user
      }));

    res.status(200).json({
      success: true,
      count: usersWithBadgeCount.length,
      data: usersWithBadgeCount
    });
  } catch (error) {
    next(error);
  }
};
