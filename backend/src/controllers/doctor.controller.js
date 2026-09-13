const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const { genererCreneaux, getJourSemaine } = require('../utils/creneaux');

const searchDoctors = async (req, res) => {
  try {
    const { specialite } = req.query;
    const filtre = specialite ? { specialite: new RegExp(specialite, 'i') } : {};
    const medecins = await DoctorProfile.find(filtre).populate('userId', 'nom prenom email photoUrl');
    return res.status(200).json({ medecins });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la recherche de médecins', error: error.message });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params; // userId du médecin
    const { date } = req.query; // format YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ message: 'Le paramètre date est requis (YYYY-MM-DD)' });
    }

    const doctorProfile = await DoctorProfile.findOne({ userId: id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Médecin introuvable' });
    }

    const jourCible = getJourSemaine(date);
    const disponibiliteJour = doctorProfile.disponibilites.find((d) => d.jour === jourCible);

    if (!disponibiliteJour) {
      return res.status(200).json({ jour: jourCible, creneaux: [] });
    }

    const tousLesCreneaux = genererCreneaux(disponibiliteJour.heureDebut, disponibiliteJour.heureFin);

    const debutJournee = new Date(`${date}T00:00:00.000Z`);
    const finJournee = new Date(`${date}T23:59:59.999Z`);
    const rdvExistants = await Appointment.find({
      medecinId: id,
      date: { $gte: debutJournee, $lte: finJournee },
      statut: { $ne: 'annule' },
    });

    const heuresPrises = rdvExistants.map((rdv) => {
      const d = new Date(rdv.date);
      return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
    });

    const creneauxDisponibles = tousLesCreneaux.filter((c) => !heuresPrises.includes(c));

    return res.status(200).json({ jour: jourCible, creneaux: creneauxDisponibles });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du calcul des créneaux', error: error.message });
  }
};

module.exports = { searchDoctors, getAvailableSlots };
