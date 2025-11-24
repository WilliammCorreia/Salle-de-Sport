const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// Generer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone, address } = req.body;

    // Verifier si l'utilisateur existe deja
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn('Tentative d\'inscription avec email existant', { email });
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà',
      });
    }

    // Creer l'utilisateur
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'client',
      phone,
      address,
    });

    logger.info('Nouvel utilisateur inscrit', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    // Generer le token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    logger.error('Erreur lors de l\'inscription', {
      error: error.message,
      stack: error.stack,
      email: req.body.email
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription",
      error: error.message,
    });
  }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifier les champs requis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis',
      });
    }

    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logger.warn('Tentative de connexion avec email inexistant', { email });
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Verifier si le compte est actif
    if (!user.isActive) {
      logger.warn('Tentative de connexion avec compte désactivé', {
        userId: user._id,
        email: user.email
      });
      return res.status(403).json({
        success: false,
        message: 'Votre compte a été désactivé',
      });
    }

    // Verifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      logger.warn('Tentative de connexion avec mot de passe incorrect', {
        userId: user._id,
        email: user.email
      });
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    logger.info('Connexion réussie', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    // Generer le token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la connexion', {
      error: error.message,
      stack: error.stack,
      email: req.body.email
    });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message,
    });
  }
};

// @desc    Obtenir le profil de l'utilisateur connecte
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('gymHalls');

    logger.debug('Récupération du profil utilisateur', {
      userId: req.user.id,
      email: req.user.email
    });

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du profil', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message,
    });
  }
};

// @desc    Mettre a jour le mot de passe
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe requis',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Verifier le mot de passe actuel
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      logger.warn('Tentative de changement de mot de passe avec ancien mot de passe incorrect', {
        userId: req.user.id,
        email: req.user.email
      });
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect',
      });
    }

    // Mettre a jour le mot de passe
    user.password = newPassword;
    await user.save();

    logger.info('Mot de passe mis à jour', {
      userId: req.user.id,
      email: req.user.email
    });

    res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du mot de passe', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du mot de passe',
      error: error.message,
    });
  }
};
