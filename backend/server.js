require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const logger = require('./src/config/logger');
const requestLogger = require('./src/middleware/logger.middleware');
const { notFound, errorHandler } = require('./src/middleware/error.middleware');

// Importation des routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const gymHallRoutes = require('./src/routes/gymHall.routes');
const exerciceRoutes = require('./src/routes/exercice.routes');

// Initialisation de l'application Express
const app = express();

// Connexion a la base de donnees
connectDB();

// Middleware
app.use(requestLogger); // Logger HTTP requests
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de test
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Salle de Sport - Bienvenue',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      gymHalls: '/api/gym-halls',
    },
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gym-halls', gymHallRoutes);
app.use('/api/exercices-types', exerciceRoutes);

// Middleware de gestion des erreurs
app.use(notFound);
  app.use(errorHandler);

// Demarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info('Serveur démarré', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    url: `http://localhost:${PORT}`,
    logLevel: process.env.LOG_LEVEL || 'info'
  });
});

// Gestion des erreurs non capturees
process.on('unhandledRejection', (err) => {
  logger.error('Rejection non gérée détectée', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Exception non capturée détectée', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

module.exports = app;
