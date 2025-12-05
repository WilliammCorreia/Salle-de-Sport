const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre du défi est requis'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Le créateur est requis'],
    },
    gymHall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GymHall',
      default: null,
    },
    equipment: [
      {
        type: String,
      }
    ],
    category: {
      type: String,
      required: true,
      enum: ['perte_poids', 'prise_masse', 'endurance', 'force', 'souplesse', 'autre'],
    },
    difficulty: {
      type: String,
      enum: ['débutant', 'intermédiaire', 'avancé', 'expert'],
      default: 'intermédiaire',
    },
    duration: {
      type: Number,
      required: [true, 'La durée du défi est requise'],
      min: 1, 
    },
    exercises: [
      {
        exerciseType: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ExercicesTypes',
          required: true,
        },
        sets: { type: Number, default: 3 },
        reps: { type: Number, default: 10 },
        restTime: { type: Number, default: 60 }, // en secondes
      },
    ],
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

challengeSchema.index({ title: 'text' });
challengeSchema.index({ difficulty: 1 });
challengeSchema.index({ gymHall: 1 });

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;