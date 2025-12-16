const Badge = require('../models/Badge.model');
const User = require('../models/User.model');
const logger = require('../config/logger');

/**
 * Service pour attribuer automatiquement les badges aux utilisateurs
 */
class BadgeAwardService {
  /**
   * Vérifie et attribue les badges applicables à un utilisateur
   * @param {String} userId - ID de l'utilisateur
   */
  async checkAndAwardBadges(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Récupérer tous les badges actifs
      const activeBadges = await Badge.find({ isActive: true });

      for (const badge of activeBadges) {
        // Vérifier si l'utilisateur a déjà ce badge
        const hasBadge = user.stats.badges.some(b => b.name === badge.name);
        if (hasBadge) continue;

        // Vérifier si l'utilisateur remplit les conditions
        const eligible = await this.checkBadgeEligibility(user, badge);

        if (eligible) {
          await this.awardBadge(user, badge);
        }
      }

      return user;
    } catch (error) {
      logger.error('Erreur lors de la vérification des badges', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Vérifie si un utilisateur est éligible pour un badge
   * @param {Object} user - L'utilisateur
   * @param {Object} badge - Le badge
   * @returns {Boolean}
   */
  async checkBadgeEligibility(user, badge) {
    const { type, value } = badge.rules;

    switch (type) {
      case 'challenges_completed':
        return user.stats.completedChallenges >= value;

      case 'workouts_count':
        return user.stats.totalWorkouts >= value;

      case 'calories_burned':
        return (user.stats.totalCalories || 0) >= value;

      case 'streak_days':
        return (user.stats.currentStreak || 0) >= value;

      case 'score_reached':
        return user.stats.score >= value;

      case 'custom':
        // Pour les règles personnalisées, on peut implémenter une logique plus complexe
        return false;

      default:
        return false;
    }
  }

  /**
   * Attribue un badge à un utilisateur
   * @param {Object} user - L'utilisateur
   * @param {Object} badge - Le badge
   */
  async awardBadge(user, badge) {
    try {
      user.stats.badges.push({
        name: badge.name,
        description: badge.description,
        earnedAt: new Date()
      });

      // Ajouter le bonus de score
      user.stats.score += badge.scoreBonus;

      await user.save();

      logger.info('Badge attribué', {
        userId: user._id,
        badgeName: badge.name,
        scoreBonus: badge.scoreBonus
      });

      return user;
    } catch (error) {
      logger.error('Erreur lors de l\'attribution du badge', {
        userId: user._id,
        badgeName: badge.name,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Vérifie les badges après une action spécifique
   * @param {String} userId - ID de l'utilisateur
   * @param {String} action - Type d'action (challenge_completed, workout_logged, etc.)
   */
  async checkBadgesAfterAction(userId, action) {
    try {
      await this.checkAndAwardBadges(userId);
      logger.info('Vérification des badges effectuée', { userId, action });
    } catch (error) {
      logger.error('Erreur lors de la vérification des badges après action', {
        userId,
        action,
        error: error.message
      });
    }
  }
}

module.exports = new BadgeAwardService();
