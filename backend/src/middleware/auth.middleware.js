const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const logger = require('../config/logger');

// Middleware pour proteger les routes (authentification)
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Verifier si le token est dans les headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Verifier si le token existe
    if (!token) {
      logger.warn('Tentative d\'accès sans token', {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Token manquant',
      });
    }

    try {
      // Verifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Recuperer l'utilisateur
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        logger.warn('Token valide mais utilisateur non trouvé', {
          userId: decoded.id,
          url: req.originalUrl
        });
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      // Verifier si le compte est actif
      if (!req.user.isActive) {
        logger.warn('Tentative d\'accès avec compte désactivé', {
          userId: req.user.id,
          email: req.user.email,
          url: req.originalUrl
        });
        return res.status(403).json({
          success: false,
          message: 'Compte désactivé',
        });
      }

      logger.debug('Authentification réussie', {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role,
        url: req.originalUrl
      });

      next();
    } catch (error) {
      logger.error('Erreur de vérification du token', {
        error: error.message,
        url: req.originalUrl,
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré',
      });
    }
  } catch (error) {
    logger.error('Erreur d\'authentification générale', {
      error: error.message,
      stack: error.stack,
      url: req.originalUrl
    });
    res.status(500).json({
      success: false,
      message: "Erreur d'authentification",
      error: error.message,
    });
  }
};

// Middleware pour autoriser certains roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.warn('Accès refusé - rôle insuffisant', {
        userId: req.user.id,
        email: req.user.email,
        userRole: req.user.role,
        requiredRoles: roles,
        url: req.originalUrl
      });
      return res.status(403).json({
        success: false,
        message: `Le role ${req.user.role} n'est pas autorise a acceder a cette ressource`,
      });
    }
    logger.debug('Autorisation accordée', {
      userId: req.user.id,
      role: req.user.role,
      url: req.originalUrl
    });
    next();
  };
};

// Middleware optionnel pour authentifier sans bloquer si pas de token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        logger.debug('Authentification optionnelle réussie', {
          userId: req.user?.id,
          url: req.originalUrl
        });
      } catch (error) {
        // Si le token est invalide, on continue sans utilisateur
        logger.debug('Token invalide dans optionalAuth', {
          error: error.message,
          url: req.originalUrl
        });
        req.user = null;
      }
    }

    next();
  } catch (error) {
    logger.error('Erreur dans optionalAuth', {
      error: error.message,
      stack: error.stack,
      url: req.originalUrl
    });
    next();
  }
};
