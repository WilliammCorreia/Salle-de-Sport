const mongoose = require('mongoose');

const challengeInvitationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});
    
challengeInvitationSchema.index({ recipient: 1, status: 1 });
challengeInvitationSchema.index({ challenge: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model('ChallengeInvitation', challengeInvitationSchema);