const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom du badge est requis'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'La description du badge est requise']
    },
    icon: {
      type: String,
      default: '🏆'
    },
    category: {
      type: String,
      enum: ['defi', 'entrainement', 'social', 'progression', 'autre'],
      default: 'autre'
    },
    // Règles d'attribution automatique
    rules: {
      type: {
        type: String,
        enum: ['challenges_completed', 'workouts_count', 'calories_burned', 'streak_days', 'score_reached', 'custom'],
        required: true
      },
      value: {
        type: Number,
        required: function() {
          return this.rules.type !== 'custom';
        }
      },
      // Pour les règles personnalisées
      customCondition: {
        type: String
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    rarity: {
      type: String,
      enum: ['commun', 'rare', 'épique', 'légendaire'],
      default: 'commun'
    },
    scoreBonus: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Index pour optimiser les recherches (name a déjà un index via unique: true)
badgeSchema.index({ category: 1 });
badgeSchema.index({ 'rules.type': 1 });
badgeSchema.index({ isActive: 1 });

module.exports = mongoose.model('Badge', badgeSchema);
