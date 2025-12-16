const Badge = require('../models/Badge.model');
const User = require('../models/User.model');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Obtenir tous les badges
// @route   GET /api/badges
// @access  Public
exports.getBadges = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, rarity, isActive } = req.query;

    const query = {};
    if (category) query.category = category;
    if (rarity) query.rarity = rarity;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const badges = await Badge.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Badge.countDocuments(query);

    res.status(200).json({
      success: true,
      count: badges.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: badges
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir un badge par ID
// @route   GET /api/badges/:id
// @access  Public
exports.getBadge = async (req, res, next) => {
  try {
    const badge = await Badge.findById(req.params.id);

    if (!badge) {
      return next(new ErrorResponse('Badge non trouvé', 404));
    }

    res.status(200).json({
      success: true,
      data: badge
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Créer un nouveau badge
// @route   POST /api/badges
// @access  Private/Admin
exports.createBadge = async (req, res, next) => {
  try {
    const badge = await Badge.create(req.body);

    res.status(201).json({
      success: true,
      data: badge
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ErrorResponse('Un badge avec ce nom existe déjà', 400));
    }
    next(error);
  }
};

// @desc    Mettre à jour un badge
// @route   PUT /api/badges/:id
// @access  Private/Admin
exports.updateBadge = async (req, res, next) => {
  try {
    let badge = await Badge.findById(req.params.id);

    if (!badge) {
      return next(new ErrorResponse('Badge non trouvé', 404));
    }

    badge = await Badge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: badge
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ErrorResponse('Un badge avec ce nom existe déjà', 400));
    }
    next(error);
  }
};

// @desc    Supprimer un badge
// @route   DELETE /api/badges/:id
// @access  Private/Admin
exports.deleteBadge = async (req, res, next) => {
  try {
    const badge = await Badge.findById(req.params.id);

    if (!badge) {
      return next(new ErrorResponse('Badge non trouvé', 404));
    }

    await badge.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Attribuer un badge manuellement à un utilisateur
// @route   POST /api/badges/:id/award/:userId
// @access  Private/Admin
exports.awardBadgeToUser = async (req, res, next) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return next(new ErrorResponse('Badge non trouvé', 404));
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(new ErrorResponse('Utilisateur non trouvé', 404));
    }

    // Vérifier si l'utilisateur a déjà ce badge
    const hasBadge = user.stats.badges.some(
      b => b.name === badge.name
    );

    if (hasBadge) {
      return next(new ErrorResponse('L\'utilisateur possède déjà ce badge', 400));
    }

    // Ajouter le badge
    user.stats.badges.push({
      name: badge.name,
      description: badge.description,
      earnedAt: new Date()
    });

    // Ajouter le bonus de score
    user.stats.score += badge.scoreBonus;

    await user.save();

    res.status(200).json({
      success: true,
      message: `Badge "${badge.name}" attribué à ${user.email}`,
      data: user.stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir tous les utilisateurs ayant un badge spécifique
// @route   GET /api/badges/:id/users
// @access  Public
exports.getUsersWithBadge = async (req, res, next) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return next(new ErrorResponse('Badge non trouvé', 404));
    }

    const users = await User.find({
      'stats.badges.name': badge.name
    }).select('firstName lastName email stats.badges');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};
