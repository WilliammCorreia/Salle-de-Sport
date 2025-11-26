const Challenge = require('../models/Challenge.model');

// @desc    Creer un nouveau défi
// @route   POST /api/challenges
// @access  Private (utilisateurs authentifiés)
exports.createChallenge = async (req, res) => {
    try {
        const creator = req.user._id.toString();
        let gymHall = null;

        const {
            title,
            description,
            category,
            difficulty,
            duration,
            durationUnit,
            exercises,
            participants,
            isActive,
        } = req.body;

        console.log("test :", req.user._id);
        if (req.body.gymHall) {
            if (req.user.role !== 'gym_owner' && req.user.role !== 'super_admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Seuls les propriétaires de salles de sport et les super administrateurs peuvent attribuer une salle de sport à un défi',
                });
            }

            const isOwner = req.user.gymHalls.some(id => id.toString() === req.body.gymHall);
      
            if (!isOwner && req.user.role !== 'super_admin') {
                return res.status(403).json({
                success: false,
                message: "Vous n'êtes pas le propriétaire de cette salle."
                });
            }

            gymHall = req.body.gymHall;
        }

        const existingChallenge = await Challenge.findOne({ title });
        if (existingChallenge) {
            return res.status(400).json({
                success: false,
                message: 'Un défi avec ce titre existe déjà',
            });
        }

        const challenge = await Challenge.create({
            title,
            description,
            creator,
            gymHall,
            category,
            difficulty,
            duration,
            durationUnit,
            exercises,
            participants,
            isActive,
        });

        res.status(201).json({
            success: true,
            data: challenge,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du défi',
            error: err.message,
        });
    }
}