const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

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
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      // Verifier si le compte est actif
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Compte désactivé',
        });
      }

      next();
    } catch (error) {
      console.error('Erreur de vérification du token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré',
      });
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
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
      return res.status(403).json({
        success: false,
        message: `Le role ${req.user.role} n'est pas autorise a acceder a cette ressource`,
      });
    }
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
      } catch (error) {
        // Si le token est invalide, on continue sans utilisateur
        console.debug('Token invalide dans optionalAuth:', error.message);
        req.user = null;
      }
    }

    next();
  } catch (error) {
    console.error('Erreur dans optionalAuth:', error);
    next();
  }
};
