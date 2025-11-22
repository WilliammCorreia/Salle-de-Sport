const mongoose = require('mongoose');

const exerciceTypeSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: [true, 'Le nom de l\'exercice est requis'],
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        required: [true, 'La description de l\'exercice est requise'],
        trim: true,
    },
    muscleGroups: {
        type: [String],
        required: [true, 'Les groupes musculaires sont requis'],
    }
},
{
    timestamps: true,
});

const ExercicesTypes = mongoose.model('ExercicesTypes', exerciceTypeSchema);

module.exports = ExercicesTypes;
