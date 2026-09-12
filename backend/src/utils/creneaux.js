/**
 * Génère une liste de créneaux ("HH:mm") entre heureDebut et heureFin,
 * par pas de dureeMinutes (30 minutes par défaut).
 */
const genererCreneaux = (heureDebut, heureFin, dureeMinutes = 30) => {
  const creneaux = [];
  const [hDebut, mDebut] = heureDebut.split(':').map(Number);
  const [hFin, mFin] = heureFin.split(':').map(Number);

  let minutesCourantes = hDebut * 60 + mDebut;
  const minutesFin = hFin * 60 + mFin;

  while (minutesCourantes + dureeMinutes <= minutesFin) {
    const heures = String(Math.floor(minutesCourantes / 60)).padStart(2, '0');
    const minutes = String(minutesCourantes % 60).padStart(2, '0');
    creneaux.push(`${heures}:${minutes}`);
    minutesCourantes += dureeMinutes;
  }

  return creneaux;
};

const JOURS_SEMAINE = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

const getJourSemaine = (date) => JOURS_SEMAINE[new Date(date).getDay()];

module.exports = { genererCreneaux, getJourSemaine, JOURS_SEMAINE };
