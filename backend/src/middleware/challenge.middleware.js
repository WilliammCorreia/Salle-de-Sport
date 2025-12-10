const challengeModel = require('../models/Challenge.model');

exports.isChallengeOwnerOrAdmin = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié',
            });
        }

        const challengeId = req.params.id;
        
        const challengeData = await challengeModel.findById(challengeId);
        if (!challengeData) {
            return res.status(404).json({
                success: false,
                message: 'Défi non trouvé',
            });
        }

        // Vérifier si l'utilisateur est le créateur du défi ou un administrateur
        if (challengeData.creator.toString() !== user.id) {
            if (user.role !== 'super_admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé - Vous n\'êtes pas le créateur du défi ou un administrateur',
                });
            }
        }

        req.challenge = challengeData;

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur dans le middleware isOwnerOrAdmin :', error,
        });
    }
}