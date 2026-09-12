const Reminder = require('../models/Reminder');

/**
 * Génère un rappel pour chaque jour entre dateDebut et dateFin (inclus),
 * pour chaque heure de prise indiquée.
 */
const generateReminders = async (medicationId, patientId, dateDebut, dateFin, heuresPrise) => {
  const rappels = [];
  const dateCourante = new Date(dateDebut);
  const dateFinale = new Date(dateFin);

  while (dateCourante <= dateFinale) {
    heuresPrise.forEach((heure) => {
      rappels.push({
        medicationId,
        patientId,
        date: new Date(dateCourante),
        heure,
        statut: 'a_venir',
      });
    });
    dateCourante.setDate(dateCourante.getDate() + 1);
  }

  return Reminder.insertMany(rappels);
};

module.exports = generateReminders;
