const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');

const register = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role, specialite } = req.body;

    const utilisateurExistant = await User.findOne({ email });
    if (utilisateurExistant) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cet email' });
    }

    const motDePasseHash = await bcrypt.hash(motDePasse, 10);

    const nouvelUtilisateur = await User.create({
      nom,
      prenom,
      email,
      motDePasseHash,
      role,
    });

    // Création automatique du profil associé selon le rôle
    if (role === 'patient') {
      await PatientProfile.create({ userId: nouvelUtilisateur._id });
    } else if (role === 'medecin') {
      await DoctorProfile.create({
        userId: nouvelUtilisateur._id,
        specialite: specialite || 'Non renseignée',
      });
    }

    const accessToken = generateAccessToken(nouvelUtilisateur);
    const refreshToken = generateRefreshToken(nouvelUtilisateur);

    return res.status(201).json({
      message: 'Compte créé avec succès',
      user: { id: nouvelUtilisateur._id, nom, prenom, email, role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'inscription", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const utilisateur = await User.findOne({ email });
    if (!utilisateur) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasseHash);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const accessToken = generateAccessToken(utilisateur);
    const refreshToken = generateRefreshToken(utilisateur);

    return res.status(200).json({
      message: 'Connexion réussie',
      user: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token manquant' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const utilisateur = await User.findById(decoded.id);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const nouvelAccessToken = generateAccessToken(utilisateur);
    return res.status(200).json({ accessToken: nouvelAccessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token invalide ou expiré' });
  }
};

module.exports = { register, login, refreshAccessToken };
