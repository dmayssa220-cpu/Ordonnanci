const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Crée une notification pour un utilisateur, sauf s'il a désactivé ce type
 * de notification dans ses préférences.
 */
const creerNotification = async (userId, type, message, lien = null) => {
  const utilisateur = await User.findById(userId);
  if (!utilisateur) return null;

  const prefs = utilisateur.preferencesNotification || {};
  if (type === 'rappel_medicament' && prefs.rappelsMedicaments === false) return null;
  if ((type === 'rappel_rendezvous' || type === 'rendezvous') && prefs.rappelsRendezVous === false) {
    return null;
  }

  return Notification.create({ userId, type, message, lien });
};

module.exports = { creerNotification };
