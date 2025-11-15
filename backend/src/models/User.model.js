const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      //   regex recup sur www.geeksforgeeks.org/javascript/how-to-validate-email-address-using-regexp-in-javascript/
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email invalide'],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['client', 'gym_owner', 'super_admin'],
      default: 'client',
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },
    // Pour les proprietaires de salle
    gymHalls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GymHall',
      },
    ],
    // Statistiques pour les client
    stats: {
      totalChallenges: {
        type: Number,
        default: 0,
      },
      completedChallenges: {
        type: Number,
        default: 0,
      },
      totalWorkouts: {
        type: Number,
        default: 0,
      },
      badges: [
        {
          name: String,
          description: String,
          earnedAt: Date,
        },
      ],
      score: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Methode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// MMethode pour obtenir l'utilisateur sans le mot de passe
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
