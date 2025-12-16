const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur est requis']
    },
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      default: null
    },
    gymHall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GymHall',
      default: null
    },
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    duration: {
      type: Number,
      required: [true, 'La durée est requise'],
      min: [1, 'La durée doit être d\'au moins 1 minute']
    },
    calories: {
      type: Number,
      default: 0,
      min: 0
    },
    exercises: [
      {
        exerciseType: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ExercicesTypes',
          required: true
        },
        sets: {
          type: Number,
          min: 1
        },
        reps: {
          type: Number,
          min: 1
        },
        weight: {
          type: Number,
          min: 0
        },
        duration: {
          type: Number,
          min: 1
        },
        notes: String
      }
    ],
    notes: {
      type: String,
      maxlength: 500
    },
    intensity: {
      type: String,
      enum: ['faible', 'modérée', 'élevée', 'maximale'],
      default: 'modérée'
    },
    mood: {
      type: String,
      enum: ['excellent', 'bon', 'moyen', 'fatigué', 'épuisé'],
      default: 'moyen'
    }
  },
  {
    timestamps: true
  }
);

// Index pour optimiser les recherches
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ challenge: 1 });
workoutSchema.index({ gymHall: 1 });
workoutSchema.index({ date: -1 });

// Middleware pour mettre à jour les statistiques utilisateur après création
workoutSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);

    if (user) {
      user.stats.totalWorkouts = (user.stats.totalWorkouts || 0) + 1;
      user.stats.totalCalories = (user.stats.totalCalories || 0) + this.calories;

      // Calculer la série de jours consécutifs
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastWorkout = await this.constructor.findOne({
        user: this.user,
        _id: { $ne: this._id },
        date: { $lt: this.date }
      }).sort({ date: -1 });

      if (lastWorkout) {
        const lastDate = new Date(lastWorkout.date);
        lastDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          user.stats.currentStreak = (user.stats.currentStreak || 0) + 1;
        } else if (diffDays === 0) {
          // Même jour, ne pas incrémenter
        } else {
          user.stats.currentStreak = 1;
        }
      } else {
        user.stats.currentStreak = 1;
      }

      await user.save();

      // Vérifier les badges après l'enregistrement de la séance
      const badgeAwardService = require('../services/badgeAward.service');
      await badgeAwardService.checkBadgesAfterAction(this.user, 'workout_logged');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des stats:', error);
  }
});

module.exports = mongoose.model('Workout', workoutSchema);
