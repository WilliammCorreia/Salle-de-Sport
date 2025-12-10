const GymHall = require('../models/GymHall.model');
const User = require('../models/User.model');
const logger = require('../config/logger');

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

    // Validations détaillées
    const errors = [];

    if (!name || name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Le nom de la salle est requis' });
    }

    if (!description || description.trim().length === 0) {
      errors.push({ field: 'description', message: 'La description est requise' });
    }

    if (!address) {
      errors.push({ field: 'address', message: "L'adresse est requise" });
    } else {
      if (!address.street) {
        errors.push({ field: 'address.street', message: 'La rue est requise' });
      }
      if (!address.city) {
        errors.push({ field: 'address.city', message: 'La ville est requise' });
      }
      if (!address.postalCode) {
        errors.push({ field: 'address.postalCode', message: 'Le code postal est requis' });
      }
    }

    if (!contact) {
      errors.push({ field: 'contact', message: 'Les informations de contact sont requises' });
    } else {
      if (!contact.phone) {
        errors.push({ field: 'contact.phone', message: 'Le téléphone de contact est requis' });
      }
      if (!contact.email) {
        errors.push({ field: 'contact.email', message: "L'email de contact est requis" });
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(contact.email)) {
        errors.push({ field: 'contact.email', message: "L'email de contact est invalide" });
      }
    }

    if (!capacity || capacity < 1) {
      errors.push({ field: 'capacity', message: 'La capacité doit être au moins 1' });
    }

    if (activityTypes && activityTypes.length > 0) {
      const validActivityTypes = [
        'musculation',
        'cardio',
        'yoga',
        'pilates',
        'crossfit',
        'boxing',
        'spinning',
        'danse',
        'natation',
        'arts_martiaux',
        'fitness',
        'escalade',
        'autre',
      ];
      const invalidTypes = activityTypes.filter((type) => !validActivityTypes.includes(type));
      if (invalidTypes.length > 0) {
        errors.push({
          field: 'activityTypes',
          message: `Types d'activités invalides: ${invalidTypes.join(', ')}`,
        });
      }
    }

    if (difficultyLevels && difficultyLevels.length > 0) {
      const validLevels = ['débutant', 'intermédiaire', 'avancé', 'expert'];
      const invalidLevels = difficultyLevels.filter((level) => !validLevels.includes(level));
      if (invalidLevels.length > 0) {
        errors.push({
          field: 'difficultyLevels',
          message: `Niveaux de difficulté invalides: ${invalidLevels.join(', ')}`,
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors,
      });
    }

    // Verifier si une salle avec ce nom existe deja
    const existingGymHall = await GymHall.findOne({ name: name.trim() });
    if (existingGymHall) {
      logger.warn("Tentative de création d'une salle avec nom existant", {
        userId: req.user.id,
        name,
      });
      return res.status(400).json({
        success: false,
        message: 'Une salle avec ce nom existe déjà',
        errors: [{ field: 'name', message: 'Ce nom est déjà utilisé' }],
      });
    }

    // Creer la salle
    const gymHall = await GymHall.create({
      name: name.trim(),
      description: description.trim(),
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

    logger.info('Nouvelle salle de sport créée', {
      gymHallId: gymHall._id,
      name: gymHall.name,
      ownerId: req.user.id,
      ownerEmail: req.user.email,
      status: gymHall.status,
      city: address?.city,
    });

    res.status(201).json({
      success: true,
      message: 'Salle de sport créée avec succès',
      data: { gymHall },
    });
  } catch (error) {
    logger.error('Erreur lors de la création de la salle', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      hallName: req.body.name,
    });

    // Gestion des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: validationErrors,
      });
    }

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

    // Validation des paramètres de pagination
    const pageNum = Number.parseInt(page);
    const limitNum = Number.parseInt(limit);

    if (Number.isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre "page" doit être un nombre supérieur à 0',
      });
    }

    if (Number.isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre "limit" doit être un nombre entre 1 et 100',
      });
    }

    // Construction du filtre
    const filter = {};

    // Si non admin, afficher uniquement les salles approuvees et actives
    if (req.user?.role !== 'super_admin') {
      filter.status = 'approved';
      filter.isActive = true;
    } else if (status) {
      // Validation du statut
      const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Le statut doit être l'un des suivants: ${validStatuses.join(', ')}`,
        });
      }
      filter.status = status;
    }

    if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }

    if (activityType) {
      const validActivityTypes = [
        'musculation',
        'cardio',
        'yoga',
        'pilates',
        'crossfit',
        'boxing',
        'spinning',
        'danse',
        'natation',
        'arts_martiaux',
        'fitness',
        'escalade',
        'autre',
      ];
      if (!validActivityTypes.includes(activityType)) {
        return res.status(400).json({
          success: false,
          message: `Le type d'activité doit être l'un des suivants: ${validActivityTypes.join(
            ', '
          )}`,
        });
      }
      filter.activityTypes = activityType;
    }

    if (owner) {
      // Vérifier si l'ID est valide
      if (!owner.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: "L'ID du propriétaire est invalide",
        });
      }
      filter.owner = owner;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (pageNum - 1) * limitNum;

    const gymHalls = await GymHall.find(filter)
      .populate('owner', 'firstName lastName email phone')
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await GymHall.countDocuments(filter);

    logger.debug('Récupération des salles de sport', {
      total,
      returned: gymHalls.length,
      page: pageNum,
      filters: { status: filter.status, city, activityType, search, owner },
      userRole: req.user?.role || 'anonymous',
    });

    res.status(200).json({
      success: true,
      data: {
        gymHalls,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des salles', {
      error: error.message,
      stack: error.stack,
    });
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
    // Validation de l'ID
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "L'ID de la salle est invalide",
      });
    }

    const gymHall = await GymHall.findById(req.params.id).populate(
      'owner',
      'firstName lastName email phone'
    );
    // .populate('proposedChallenges'); // TODO: Activer quand le modèle Challenge sera créé

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
      logger.warn('Accès refusé à une salle non approuvée', {
        gymHallId: gymHall._id,
        status: gymHall.status,
        userId: req.user?.id,
        userRole: req.user?.role,
      });
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette salle',
      });
    }

    logger.debug('Salle récupérée avec succès', {
      gymHallId: gymHall._id,
      name: gymHall.name,
      status: gymHall.status,
      userId: req.user?.id,
    });

    res.status(200).json({
      success: true,
      data: { gymHall },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de la salle', {
      error: error.message,
      stack: error.stack,
      gymHallId: req.params.id,
      userId: req.user?.id,
    });
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

    logger.info('Salle de sport approuvée', {
      adminId: req.user.id,
      gymHallId: gymHall._id,
      gymHallName: gymHall.name,
      ownerId: gymHall.owner,
    });

    res.status(200).json({
      success: true,
      message: 'Salle de sport approuvée avec succès',
      data: { gymHall },
    });
  } catch (error) {
    logger.error("Erreur lors de l'approbation de la salle", {
      error: error.message,
      stack: error.stack,
      adminId: req.user?.id,
      gymHallId: req.params.id,
    });
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

    logger.warn('Salle de sport rejetée', {
      adminId: req.user.id,
      gymHallId: gymHall._id,
      gymHallName: gymHall.name,
      ownerId: gymHall.owner,
    });

    res.status(200).json({
      success: true,
      message: 'Salle de sport rejetée',
      data: { gymHall },
    });
  } catch (error) {
    logger.error('Erreur lors du rejet de la salle', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?.id,
      gymHallId: req.params.id,
    });
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

    logger.warn('Salle de sport suspendue', {
      adminId: req.user.id,
      gymHallId: gymHall._id,
      gymHallName: gymHall.name,
      ownerId: gymHall.owner,
    });

    res.status(200).json({
      success: true,
      message: 'Salle de sport suspendue',
      data: { gymHall },
    });
  } catch (error) {
    logger.error('Erreur lors de la suspension de la salle', {
      error: error.message,
      stack: error.stack,
      adminId: req.user?.id,
      gymHallId: req.params.id,
    });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suspension de la salle',
      error: error.message,
    });
  }
};
