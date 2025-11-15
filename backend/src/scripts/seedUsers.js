const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importer le modele User
const User = require('../models/User.model');

// Connexion a MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tspark';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connecte');
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Creer les utilisateurs de test
const seedUsers = async () => {
  try {
    // Supprimer les utilisateurs existants avec ces emails
    await User.deleteMany({
      email: { $in: ['user@user.com', 'admin@admin.com', 'owner@owner.com'] },
    });

    console.log('Anciens comptes supprimes');

    // Creer les 3 utilisateurs
    const users = [
      {
        email: 'user@user.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'Client',
        role: 'client',
        isActive: true,
      },
      {
        email: 'admin@admin.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'Super',
        role: 'super_admin',
        isActive: true,
      },
      {
        email: 'owner@owner.com',
        password: 'password123',
        firstName: 'Owner',
        lastName: 'Gym',
        role: 'gym_owner',
        isActive: true,
      },
    ];

    // Inserer les utilisateurs (le password sera hashe automatiquement par le pre-save hook)
    for (const userData of users) {
      const user = await User.create(userData);
      console.log(`Utilisateur cree: ${user.email} (${user.role})`);
    }

    console.log('\nBase de donnees initialisee avec succes !');
    console.log('\nComptes crees:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('CLIENT:');
    console.log('   Email    : user@user.com');
    console.log('   Password : password123');
    console.log('   Role     : client');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ADMIN:');
    console.log('   Email    : admin@admin.com');
    console.log('   Password : password123');
    console.log('   Role     : super_admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PROPRIETAIRE:');
    console.log('   Email    : owner@owner.com');
    console.log('   Password : password123');
    console.log('   Role     : gym_owner');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('Erreur lors de la creation des utilisateurs:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion MongoDB fermee');
  }
};

// Executer le script
const run = async () => {
  await connectDB();
  await seedUsers();
};

run();
