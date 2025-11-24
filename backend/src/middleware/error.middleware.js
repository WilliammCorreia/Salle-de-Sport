const logger = require('../config/logger');

// Middleware pour gerer les erreurs 404
exports.notFound = (req, res, next) => {
  logger.warn('Route non trouvée', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  res.status(404).json({
    success: false,
    message: `Route non trouvée - ${req.originalUrl}`,
  });
};

// Middleware pour gerer les erreurs globales
exports.errorHandler = (err, req, res, next) => {
  logger.error('Erreur globale capturée', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip
  });

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    logger.warn('Erreur de validation Mongoose', {
      url: req.originalUrl,
      errors,
      userId: req.user?.id
    });

    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors,
    });
  }

  // Erreur de duplication MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];

    logger.warn('Erreur de duplication MongoDB', {
      url: req.originalUrl,
      field,
      value: err.keyValue,
      userId: req.user?.id
    });

    return res.status(400).json({
      success: false,
      message: `${field} existe deja`,
    });
  }

  // Erreur de cast MongoDB (ID invalide)
  if (err.name === 'CastError') {
    logger.warn('Erreur de cast MongoDB (ID invalide)', {
      url: req.originalUrl,
      path: err.path,
      value: err.value,
      userId: req.user?.id
    });

    return res.status(400).json({
      success: false,
      message: 'ID invalide',
    });
  }

  // Erreur par defaut
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
