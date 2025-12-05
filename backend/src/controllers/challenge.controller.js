const Challenge = require('../models/Challenge.model');
const gymHallModel = require('../models/GymHall.model');

// @desc    Creer un nouveau défi
// @route   POST /api/challenges
// @access  Private (utilisateurs authentifiés)
exports.createChallenge = async (req, res) => {
    try {
        const creator = req.user._id.toString();

        const {
            title,
            description,
            category,
            difficulty,
            duration,
            exercises,
            isActive =  true,
            equipment = [],
            gymHall = null
        } = req.body;

        if (gymHall) {
            const validation = await validateGymAndEquipment(req.user, gymHall, equipment);
            if (validation) {
                return res.status(403).json({
                    success: false,
                    message: validation,
                });
            }
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
            equipment,
            category,
            difficulty,
            duration,
            exercises,
            participants: [],
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

// @desc    Récupérer tous les défis
// @route   GET /api/challenges
// @access  Private (utilisateurs authentifiés)
exports.getChallenges = async (req, res) => {
    const query = req.query;
    const filter = {};

    console.log("query;:", query)

    if (query.difficulty) {
        const difficulties = ['débutant', 'intermédiaire', 'avancé', 'expert'];

        if (!difficulties.includes(query.difficulty)) {
            throw new Error('La difficulté renseignées est introuvable');
        }

        filter.difficulty = query.difficulty;
    }

    if (query.minDuration) filter.duration = { $gte: query.minDuration };
    if (query.maxDuration) filter.duration = { $lte: query.maxDuration };
    if (query.minDuration && query.maxDuration) filter.duration = { $gte: query.minDuration, $lte: query.maxDuration };

    if (query.exercicesTypes) {
        if (!Array.isArray(query.exercicesTypes)) {
            filter["exercises.exerciseType"] = { $in: query.exercicesTypes };
        } else {
            filter["exercises.exerciseType"] = { $all: query.exercicesTypes };
        }
        console.log("filter exercicesTypes:", filter);
    }

    try {
        const challenges = await Challenge.find(filter)
            .populate('creator', 'firstName lastName')
            .populate('gymHall', 'name')
            .populate('exercises.exerciseType');

        res.status(200).json({
            success: true,
            data: challenges,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des défis',
            error: err.message,
        });
    }
}

// @desc    Récupérer un défi par ID
// @route   GET /api/challenges/:id
// @access  Private (utilisateurs authentifiés)
exports.getChallengeById = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .populate('creator', 'firstName lastName')
            .populate('gymHall', 'name')
            .populate('exercises.exerciseType');

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Défi non trouvé',
            });
        }

        res.status(200).json({
            success: true,
            data: challenge,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du défi',
            error: err.message,
        });
    }
}

// @desc    Mettre à jour un défi par ID
// @route   PUT /api/challenges/:id
// @access  Private (utilisateurs authentifiés)
exports.updateChallenge = async (req, res) => {
    try {
        const challengeToUpdate = req.challenge;
        const updates = req.body;
        const creator = req.user;
        
        const gymHallId = (updates.gymHall !== undefined) ? updates.gymHall : challengeToUpdate.gymHall;
        const equipmentList = (updates.equipment !== undefined) ? updates.equipment : challengeToUpdate.equipment;

        const gymHallChanged = updates.gymHall !== undefined && updates.gymHall.toString() !== challengeToUpdate.gymHall?.toString();
        const equipmentChanged = updates.equipment !== undefined && JSON.stringify(updates.equipment) !== JSON.stringify(challengeToUpdate.equipment);

        if (gymHallChanged || equipmentChanged) {
            const validation = await validateGymAndEquipment(creator, gymHallId, equipmentList);
            if (validation) {
                return res.status(403).json({
                    success: false,
                    message: validation,
                });
            }
        }

        const allowableFields = [
            "title",
            "description",
            "gymHall",
            "equipment",
            "category",
            "difficulty",
            "duration",
            "exercises",
            "isActive"
        ];

        allowableFields.forEach(field => {
            if (updates[field] !== undefined) {
                challengeToUpdate[field] = updates[field];
            }
        });
    
        const savedChallenge = await challengeToUpdate.save();

        if (!savedChallenge) {
            return res.status(404).json({
                success: false,
                message: 'Erreur lors de la mise à jour du défi',
            });
        }

        res.status(200).json({
            success: true,
            data: savedChallenge,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du défi',
            error: err.message,
        });
    }
}

// @desc    Supprimer un défi par ID
// @route   DELETE /api/challenges/:id
// @access  Private (créateur du défi ou super_admin)
exports.deleteChallenge = async (req, res) => {
    try {
        const challengeToDelete = req.challenge;

        const deletedChallenge = await Challenge.findByIdAndDelete(challengeToDelete._id);

        if (!deletedChallenge) {
            return res.status(404).json({
                success: false,
                message: 'Erreur lors de la suppression du défi',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Défi supprimé avec succès',
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du défi',
            error: err.message,
        });
    }
}

/**
 * Vérifie si l'utilisateur a le droit d'utiliser cette salle
 * ET si la salle possède les équipements demandés.
 * Retourne null si tout est OK, ou un message d'erreur (string).
 */
const validateGymAndEquipment = async (user, gymId, equipmentList) => {
    // Vérification Propriétaire Salle
    if (gymId) {
        const isSuperAdmin = user.role === 'super_admin';
        const isGymOwner = user.role === 'gym_owner';

        if (!isGymOwner && !isSuperAdmin) {
            return "Seuls les propriétaires et admins peuvent lier une salle.";
        }

        const ownsGym = user.gymHalls.some(id => id.toString() === gymId.toString());
        if (!ownsGym && !isSuperAdmin) {
            return "Vous n'êtes pas le propriétaire de cette salle.";
        }
    }

    // Vérification Équipement
    if (equipmentList && equipmentList.length > 0 && gymId) {
        const gymHallData = await gymHallModel.findById(gymId).select('equipment');
        if (!gymHallData) return "Salle de sport introuvable.";
        console.log("gymHallData", gymHallData);

        const gymHallEquipment = gymHallData.equipment.map(e => e.name);
        const gymHallDataSet = new Set(gymHallEquipment);
        
        const missingEquipment = equipmentList.filter(item => !gymHallDataSet.has(item));
        
        if (missingEquipment.length > 0) {
            return `Équipement manquant dans la salle : ${missingEquipment.join(', ')}`;
        }
    }

    return null;
};