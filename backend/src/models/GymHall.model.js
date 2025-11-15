const mongoose = require('mongoose');

const gymHallSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la salle est requis'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Le propriétaire est requis'],
    },
    address: {
      street: {
        type: String,
        required: [true, 'La rue est requise'],
      },
      city: {
        type: String,
        required: [true, 'La ville est requise'],
      },
      postalCode: {
        type: String,
        required: [true, 'Le code postal est requis'],
      },
      country: {
        type: String,
        required: [true, 'Le pays est requis'],
        default: 'France',
      },
    },
    contact: {
      phone: {
        type: String,
        required: [true, 'Le téléphone est requis'],
      },
      email: {
        type: String,
        required: [true, "L'email est requis"],
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email invalide'],
      },
      website: {
        type: String,
        trim: true,
      },
    },
    capacity: {
      type: Number,
      required: [true, 'La capacité est requise'],
      min: [1, 'La capacité doit être au moins 1'],
    },
    equipment: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        description: String,
      },
    ],
    facilities: [
      {
        type: String,
        trim: true,
      },
    ],
    activityTypes: [
      {
        type: String,
        enum: [
          'musculation',
          'cardio',
          'yoga',
          'pilates',
          'crossfit',
          'boxing',
          'spinning',
          'danse',
          'natation',
          'arts_martiaux',
          'fitness',
          'autre',
        ],
      },
    ],
    difficultyLevels: [
      {
        type: String,
        enum: ['débutant', 'intermédiaire', 'avancé', 'expert'],
      },
    ],
    openingHours: {
      monday: { open: String, close: String, closed: { type: Boolean, default: false } },
      tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
      friday: { open: String, close: String, closed: { type: Boolean, default: false } },
      saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
      sunday: { open: String, close: String, closed: { type: Boolean, default: false } },
    },
    pricing: {
      dailyPass: Number,
      monthlySubscription: Number,
      yearlySubscription: Number,
      currency: {
        type: String,
        default: 'EUR',
      },
    },
    images: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    // Defis proposes par cette salle
    proposedChallenges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
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

// Index pour la recherche
gymHallSchema.index({ name: 'text', description: 'text' });
gymHallSchema.index({ 'address.city': 1 });
gymHallSchema.index({ status: 1 });
gymHallSchema.index({ owner: 1 });

const GymHall = mongoose.model('GymHall', gymHallSchema);

module.exports = GymHall;
