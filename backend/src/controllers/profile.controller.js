const path = require('path');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');

const getMyProfile = async (req, res) => {
  try {
    const utilisateur = await User.findById(req.user.id).select('-motDePasseHash');
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    let profil = null;
    if (utilisateur.role === 'patient') {
      profil = await PatientProfile.findOne({ userId: utilisateur._id });
    } else if (utilisateur.role === 'medecin') {
      profil = await DoctorProfile.findOne({ userId: utilisateur._id });
    }

    return res.status(200).json({ utilisateur, profil });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération du profil', error: error.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const utilisateur = await User.findById(req.user.id);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const { nom, prenom, telephone, photoUrl, ...donneesSpecifiques } = req.body;

    if (nom) utilisateur.nom = nom;
    if (prenom) utilisateur.prenom = prenom;
    if (telephone) utilisateur.telephone = telephone;
    if (photoUrl) utilisateur.photoUrl = photoUrl;
    await utilisateur.save();

    let profil = null;
    if (utilisateur.role === 'patient') {
      profil = await PatientProfile.findOneAndUpdate(
        { userId: utilisateur._id },
        { $set: donneesSpecifiques },
        { new: true, upsert: true }
      );
    } else if (utilisateur.role === 'medecin') {
      profil = await DoctorProfile.findOneAndUpdate(
        { userId: utilisateur._id },
        { $set: donneesSpecifiques },
        { new: true, upsert: true }
      );
    }

    return res.status(200).json({ message: 'Profil mis à jour', utilisateur, profil });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error: error.message });
  }
};

/**
 * Upload de la photo de profil (avatar). Réutilise le même pattern multer
 * que la Phase 5 (upload d'ordonnance) : le fichier est déjà écrit dans
 * backend/uploads par le middleware multer configuré dans les routes.
 */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image reçue (champ "avatar" requis)' });
    }

    const utilisateur = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { photoUrl: `/uploads/${path.basename(req.file.path)}` } },
      { new: true }
    ).select('-motDePasseHash');

    return res.status(200).json({ message: 'Photo de profil mise à jour', utilisateur });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'upload de l'avatar", error: error.message });
  }
};

module.exports = { getMyProfile, updateMyProfile, uploadAvatar };
