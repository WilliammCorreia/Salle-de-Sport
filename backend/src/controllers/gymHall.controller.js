const GymHall = require('../models/GymHall.model');
const User = require('../models/User.model');

// @desc    Creer une nouvelle salle de sport
// @route   POST /api/gym-halls
// @access  Private (gym_owner ou super_admin)
exports.createGymHall = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      contact,
      capacity,
      equipment,
      facilities,
      activityTypes,
      difficultyLevels,
      openingHours,
      pricing,
      images,
    } = req.body;

    // Verifier que l'utilisateur est proprietaire ou admin
    if (req.user.role !== 'gym_owner' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les propriétaires de salle et les administrateurs peuvent créer une salle',
      });
    }

    // Verifier si une salle avec ce nom existe deja
    const existingGymHall = await GymHall.findOne({ name });
    if (existingGymHall) {
      return res.status(400).json({
        success: false,
        message: 'Une salle avec ce nom existe déjà',
      });
    }

    // Creer la salle
    const gymHall = await GymHall.create({
      name,
      description,
      owner: req.user.id,
      address,
      contact,
      capacity,
      equipment,
      facilities,
      activityTypes,
      difficultyLevels,
      openingHours,
      pricing,
      images,
      status: req.user.role === 'super_admin' ? 'approved' : 'pending',
    });

    // Ajouter la salle a la liste des salles du proprietaire
    await User.findByIdAndUpdate(req.user.id, { $push: { gymHalls: gymHall._id } });

    res.status(201).json({
      success: true,
      message: 'Salle de sport créée avec succès',
      data: { gymHall },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la salle',
      error: error.message,
    });
  }
};

// @desc    Obtenir toutes les salles de sport (avec pagination et filtres)
// @route   GET /api/gym-halls
// @access  Public
exports.getAllGymHalls = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, city, activityType, search, owner } = req.query;

    // Construction du filtre
    const filter = {};

    // Si non admin, afficher uniquement les salles approuvees
    if (req.user?.role !== 'super_admin') {
      filter.status = 'approved';
      filter.isActive = true;
    } else if (status) {
      filter.status = status;
    }

    if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }

    if (activityType) {
      filter.activityTypes = activityType;
    }

    if (owner) {
      filter.owner = owner;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const gymHalls = await GymHall.find(filter)
      .populate('owner', 'firstName lastName email phone')
      .limit(Number.parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await GymHall.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        gymHalls,
        pagination: {
          total,
          page: Number.parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des salles',
      error: error.message,
    });
  }
};

// @desc    Obtenir une salle de sport par ID
// @route   GET /api/gym-halls/:id
// @access  Public
exports.getGymHallById = async (req, res) => {
  try {
    const gymHall = await GymHall.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone')
      .populate('proposedChallenges');

    if (!gymHall) {
      return res.status(404).json({
        success: false,
        message: 'Salle de sport non trouvée',
      });
    }

    // Si non admin et salle non approuvee, verifier si c'est le proprietaire
    if (
      gymHall.status !== 'approved' &&
      req.user?.role !== 'super_admin' &&
      req.user?.id !== gymHall.owner._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette salle',
      });
    }

    res.status(200).json({
      success: true,
      data: { gymHall },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la salle',
      error: error.message,
    });
  }
};

// @desc    Mettre a jour une salle de sport
// @route   PUT /api/gym-halls/:id
// @access  Private (owner ou super_admin)
exports.updateGymHall = async (req, res) => {
  try {
    const gymHall = await GymHall.findById(req.params.id);

    if (!gymHall) {
      return res.status(404).json({
        success: false,
        message: 'Salle de sport non trouvée',
      });
    }

    // Verifier les permissions
    if (req.user.role !== 'super_admin' && gymHall.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette salle',
      });
    }

    // Mettre a jour les champs
    const allowedUpdates = [
      'name',
      'description',
      'address',
      'contact',
      'capacity',
      'equipment',
      'facilities',
      'activityTypes',
      'difficultyLevels',
      'openingHours',
      'pricing',
      'images',
    ];

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        gymHall[field] = req.body[field];
      }
    }

    await gymHall.save();

    res.status(200).json({
      success: true,
      message: 'Salle de sport mise à jour avec succès',
      data: { gymHall },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la salle',
      error: error.message,
    });
  }
};

// @desc    Supprimer une salle de sport
// @route   DELETE /api/gym-halls/:id
// @access  Private (owner ou super_admin)
exports.deleteGymHall = async (req, res) => {
  try {
    const gymHall = await GymHall.findById(req.params.id);

    if (!gymHall) {
      return res.status(404).json({
        success: false,
        message: 'Salle de sport non trouvée',
      });
    }

    // Verifier les permissions
    if (req.user.role !== 'super_admin' && gymHall.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cette salle',
      });
    }

    // Retirer la salle de la liste du proprietaire
    await User.findByIdAndUpdate(gymHall.owner, { $pull: { gymHalls: gymHall._id } });

    await gymHall.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Salle de sport supprimée avec succès',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la salle',
      error: error.message,
    });
  }
};

// @desc    Approuver une salle de sport
// @route   PUT /api/gym-halls/:id/approve
// @access  Private/Admin
exports.approveGymHall = async (req, res) => {
  try {
    const gymHall = await GymHall.findById(req.params.id);

    if (!gymHall) {
      return res.status(404).json({
        success: false,
        message: 'Salle de sport non trouvée',
      });
    }

    gymHall.status = 'approved';
    await gymHall.save();

    res.status(200).json({
      success: true,
      message: 'Salle de sport approuvée avec succès',
      data: { gymHall },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'approbation de la salle",
      error: error.message,
    });
  }
};

// @desc    Rejeter une salle de sport
// @route   PUT /api/gym-halls/:id/reject
// @access  Private/Admin
exports.rejectGymHall = async (req, res) => {
  try {
    const gymHall = await GymHall.findById(req.params.id);

    if (!gymHall) {
      return res.status(404).json({
        success: false,
        message: 'Salle de sport non trouvée',
      });
    }

    gymHall.status = 'rejected';
    await gymHall.save();

    res.status(200).json({
      success: true,
      message: 'Salle de sport rejetée',
      data: { gymHall },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet de la salle',
      error: error.message,
    });
  }
};

// @desc    Suspendre une salle de sport
// @route   PUT /api/gym-halls/:id/suspend
// @access  Private/Admin
exports.suspendGymHall = async (req, res) => {
  try {
    const gymHall = await GymHall.findById(req.params.id);

    if (!gymHall) {
      return res.status(404).json({
        success: false,
        message: 'Salle de sport non trouvée',
      });
    }

    gymHall.status = 'suspended';
    gymHall.isActive = false;
    await gymHall.save();

    res.status(200).json({
      success: true,
      message: 'Salle de sport suspendue',
      data: { gymHall },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suspension de la salle',
      error: error.message,
    });
  }
};
