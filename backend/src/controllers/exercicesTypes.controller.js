const ExercicesTypes = require('../models/ExercicesTypes.model');

// @desc    Recuperer tous les types d'exercices avec pagination
// @route   GET /api/exercices-types
// @access  Private (super_admin)
exports.getAllExerciceTypes = async (req, res) => {
    try  {
        const {page = 1, limit = 10} = req.query;

        const skip = (page - 1) * limit;

        const exerciceTypes = await ExercicesTypes
            .find()
            .skip(skip)
            .limit(limit);

        const total = await ExercicesTypes.countDocuments();

        return res.status(200).json({
            success: true,
            data: {
                exerciceTypes,
                pagination: {
                    total,
                    page: Number.parseInt(page),
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des types d\'exercices',
            error: err.message,
        });
    }
}

// @desc    Creer un nouveau type d'exercice
// @route   POST /api/exercices-types
// @access  Private (super_admin)
exports.createExerciceType = async (req, res) => {
    try {
        const { name, description, muscleGroups } = req.body;

        const existingType = await ExercicesTypes.findOne({ name });
        if (existingType) {
            return res.status(400).json({
                success: false,
                message: 'Un type d\'exercice avec ce nom existe déjà',
            });
        }

        const exerciceType = await ExercicesTypes.create({
            name,
            description,
            muscleGroups,
        });

        res.status(201).json({
            success: true,
            message: 'Type d\'exercice créé avec succès',
            data: exerciceType,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du type d\'exercice',
            error: err.message,
        });
    }
}

// @desc    Mettre a jour un type d'exercice par ID
// @route   PUT /api/exercices-types/:id
// @access  Private (super_admin)
exports.updateExerciceType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, muscleGroups } = req.body;

        const exerciceType = await ExercicesTypes.findById(id);
        if (!exerciceType) {
            return res.status(404).json({
                success: false,
                message: 'Type d\'exercice non trouvé',
            });
        }

        // Vérifier l'unicité du nom si modifié
        if (name && name !== exerciceType.name) {
            const existingType = await ExercicesTypes.findOne({ name });
            if (existingType) {
                return res.status(400).json({
                    success: false,
                    message: 'Un type d\'exercice avec ce nom existe déjà',
                });
            }
        }

        exerciceType.name = name || exerciceType.name;
        exerciceType.description = description || exerciceType.description;
        exerciceType.muscleGroups = muscleGroups || exerciceType.muscleGroups;

        await exerciceType.save();

        res.status(200).json({
            success: true,
            message: 'Type d\'exercice mis à jour avec succès',
            data: exerciceType,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du type d\'exercice',
            error: err.message,
        });
    }
}

// @desc    Supprimer un type d'exercice par ID
// @route   DELETE /api/exercices-types/:id
// @access  Private (super_admin)
exports.deleteExerciceType = async (req, res) => {
    try {
        const { id } = req.params;

        const exerciceType = await ExercicesTypes.findById(id);
        if (!exerciceType) {
            return res.status(404).json({
                success: false,
                message: 'Type d\'exercice non trouvé',
            });
        }

        await exerciceType.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Type d\'exercice supprimé avec succès',
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du type d\'exercice',
            error: err.message,
        });
    }
}