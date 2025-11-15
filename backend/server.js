require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const { notFound, errorHandler } = require('./src/middleware/error.middleware');

// Importation des routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const gymHallRoutes = require('./src/routes/gymHall.routes');

// Initialisation de l'application Express
const app = express();

// Connexion a la base de donnees
connectDB();

// Middleware
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

// Middleware de gestion des erreurs
app.use(notFound);
app.use(errorHandler);

// Demarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API disponible sur: http://localhost:${PORT}`);
});

module.exports = app;
