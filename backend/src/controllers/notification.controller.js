const Notification = require('../models/Notification');
const User = require('../models/User');

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des notifications', error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { lu: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification introuvable' });
    return res.status(200).json({ notification });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, lu: false }, { $set: { lu: true } });
    return res.status(200).json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const { rappelsMedicaments, rappelsRendezVous, messages } = req.body;

    const miseAJour = {};
    if (rappelsMedicaments !== undefined) miseAJour['preferencesNotification.rappelsMedicaments'] = rappelsMedicaments;
    if (rappelsRendezVous !== undefined) miseAJour['preferencesNotification.rappelsRendezVous'] = rappelsRendezVous;
    if (messages !== undefined) miseAJour['preferencesNotification.messages'] = messages;

    const utilisateur = await User.findByIdAndUpdate(req.user.id, { $set: miseAJour }, { new: true }).select(
      '-motDePasseHash'
    );

    return res.status(200).json({ message: 'Préférences mises à jour', utilisateur });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, updateNotificationPreferences };
