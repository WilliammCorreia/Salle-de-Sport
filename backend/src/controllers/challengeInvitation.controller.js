const Challenge = require('../models/Challenge.model');
const ChallengeInvitation = require('../models/ChallengeInvitation.model');

// @desc    Répondre à une invitation (Accepter/Refuser)
// @route   PUT /api/invitations/:id/respond
exports.respondToInvitation = async (req, res) => {
    try {
        const { status } = req.body;
        const invitationId = req.params.id;
        const userId = req.user.id;

        const invitation = await ChallengeInvitation.findById(invitationId);
        if (!invitation) {
            return res.status(404).json({ success: false, message: "Invitation introuvable." });
        }

        if (invitation.recipient.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Ce n'est pas votre invitation." });
        }

        invitation.status = status;
        await invitation.save();

        if (status === 'accepted') {
            await Challenge.findByIdAndUpdate(invitation.challenge, {
                $addToSet: { participants: userId }
            });
        }

        res.status(200).json({
            success: true,
            message: `Invitation ${status === 'accepted' ? 'acceptée' : 'refusée'}`,
            data: invitation
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};