const User = require('../models/User.model');
const GymHall = require('../models/GymHall.model');
const logger = require('../config/logger');

// @desc    Obtenir tous les utilisateurs (avec pagination et filtres)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive, search } = req.query;

    // Construction du filtre
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .populate('gymHalls')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    logger.info('Récupération de tous les utilisateurs', {
      adminId: req.user.id,
      totalUsers: total,
      page,
      filters: { role, isActive, search }
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des utilisateurs', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message,
    });
  }
};

// @desc    Obtenir un utilisateur par ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('gymHalls');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'utilisateur",
      error: error.message,
    });
  }
};

// @desc    Mettre a jour un utilisateur
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, profileImage } = req.body;

    // Verifier que l'utilisateur ne modifie que son propre profil (sauf admin)
    if (req.user.role !== 'super_admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce profil',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Mettre a jour les champs
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'utilisateur",
      error: error.message,
    });
  }
};

// @desc    Desactiver un utilisateur
// @route   PUT /api/users/:id/deactivate
// @access  Private/Admin
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    user.isActive = false;
    await user.save();

    logger.warn('Utilisateur désactivé', {
      adminId: req.user.id,
      targetUserId: user._id,
      targetEmail: user.email
    });

    res.status(200).json({
      success: true,
      message: 'Utilisateur désactivé avec succès',
      data: { user },
    });
  } catch (error) {
    logger.error('Erreur lors de la désactivation de l\'utilisateur', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?.id,
      targetUserId: req.params.id
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de la désactivation de l'utilisateur",
      error: error.message,
    });
  }
};

// @desc    Reactiver un utilisateur
// @route   PUT /api/users/:id/activate
// @access  Private/Admin
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Utilisateur activé avec succès',
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'activation de l'utilisateur",
      error: error.message,
    });
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Si l'utilisateur est proprietaire de salles, gerer la suppression
    if (user.gymHalls && user.gymHalls.length > 0) {
      logger.info('Suppression des salles associées à l\'utilisateur', {
        userId: user._id,
        gymHallsCount: user.gymHalls.length
      });
      await GymHall.deleteMany({ _id: { $in: user.gymHalls } });
    }

    await user.deleteOne();

    logger.warn('Utilisateur supprimé', {
      adminId: req.user.id,
      deletedUserId: user._id,
      deletedEmail: user.email,
      hadGymHalls: user.gymHalls?.length || 0
    });

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'utilisateur', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?.id,
      targetUserId: req.params.id
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'utilisateur",
      error: error.message,
    });
  }
};

// @desc    Changer le role d'un utilisateur
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['client', 'gym_owner', 'super_admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    logger.warn('Rôle utilisateur modifié', {
      adminId: req.user.id,
      targetUserId: user._id,
      targetEmail: user.email,
      oldRole,
      newRole: role
    });

    res.status(200).json({
      success: true,
      message: 'Rôle mis à jour avec succès',
      data: { user },
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du rôle', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?.id,
      targetUserId: req.params.id,
      attemptedRole: req.body.role
    });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du rôle',
      error: error.message,
    });
  }
};

// @desc    Obtenir les statistiques d'un utilisateur
// @route   GET /api/users/:id/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    // Verifier que l'utilisateur ne consulte que ses propres stats (sauf admin)
    if (req.user.role !== 'super_admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à consulter ces statistiques',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: { stats: user.stats },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
    });
  }
};
