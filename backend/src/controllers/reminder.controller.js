const Reminder = require('../models/Reminder');

const getMyReminders = async (req, res) => {
  try {
    const { date } = req.query; // format attendu : YYYY-MM-DD (optionnel)

    let filtreDate = {};
    if (date) {
      const debutJournee = new Date(`${date}T00:00:00.000Z`);
      const finJournee = new Date(`${date}T23:59:59.999Z`);
      filtreDate = { date: { $gte: debutJournee, $lte: finJournee } };
    }

    const rappels = await Reminder.find({ patientId: req.user.id, ...filtreDate })
      .populate('medicationId', 'nom dosage')
      .sort({ date: 1, heure: 1 });

    return res.status(200).json({ rappels });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des rappels', error: error.message });
  }
};

const updateReminderStatus = async (req, res) => {
  try {
    const { statut } = req.body; // 'pris' | 'oublie' | 'reporte'

    const rappel = await Reminder.findOneAndUpdate(
      { _id: req.params.id, patientId: req.user.id },
      { $set: { statut } },
      { new: true }
    );

    if (!rappel) return res.status(404).json({ message: 'Rappel introuvable' });

    return res.status(200).json({ message: 'Statut du rappel mis à jour', rappel });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour du rappel', error: error.message });
  }
};

module.exports = { getMyReminders, updateReminderStatus };
