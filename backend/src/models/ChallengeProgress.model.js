const mongoose = require('mongoose');

const challengeProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur est requis']
    },
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: [true, 'Le défi est requis']
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'abandoned'],
      default: 'not_started'
    },
    progression: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    startDate: {
      type: Date,
      default: null
    },
    completionDate: {
      type: Date,
      default: null
    },
    workouts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout'
      }
    ],
    notes: {
      type: String,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

// Index unique pour éviter les doublons
challengeProgressSchema.index({ user: 1, challenge: 1 }, { unique: true });
challengeProgressSchema.index({ status: 1 });
challengeProgressSchema.index({ user: 1, status: 1 });

// Middleware pour mettre à jour automatiquement les dates
challengeProgressSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'in_progress' && !this.startDate) {
      this.startDate = new Date();
    }
    if (this.status === 'completed' && !this.completionDate) {
      this.completionDate = new Date();
      this.progression = 100;
    }
  }
  next();
});

// Middleware post-save pour mettre à jour les stats utilisateur
challengeProgressSchema.post('save', async function() {
  if (this.status === 'completed') {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.user);

      if (user) {
        user.stats.completedChallenges = (user.stats.completedChallenges || 0) + 1;
        await user.save();

        // Vérifier les badges après complétion d'un défi
        const badgeAwardService = require('../services/badgeAward.service');
        await badgeAwardService.checkBadgesAfterAction(this.user, 'challenge_completed');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des stats:', error);
    }
  }
});

module.exports = mongoose.model('ChallengeProgress', challengeProgressSchema);
