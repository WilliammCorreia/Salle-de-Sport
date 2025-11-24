const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    logger.info('MongoDB connecté avec succès', {
      host: conn.connection.host,
      database: conn.connection.name,
      port: conn.connection.port
    });

    // Logs des événements MongoDB
    mongoose.connection.on('error', (err) => {
      logger.error('Erreur MongoDB après connexion initiale', {
        error: err.message,
        stack: err.stack
      });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB déconnecté');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnecté');
    });

  } catch (error) {
    logger.error('Erreur de connexion MongoDB', {
      error: error.message,
      stack: error.stack,
      uri: process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') // Masquer le mot de passe
    });
    process.exit(1);
  }
};

module.exports = connectDB;
