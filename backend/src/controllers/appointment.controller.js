const Appointment = require('../models/Appointment');
const { creerNotification } = require('../services/notificationService');

const createAppointment = async (req, res) => {
  try {
    const { medecinId, date, heure, motif } = req.body;
    const dateHeure = new Date(`${date}T${heure}:00.000Z`);

    const conflit = await Appointment.findOne({
      medecinId,
      date: dateHeure,
      statut: { $ne: 'annule' },
    });
    if (conflit) {
      return res.status(409).json({ message: "Ce créneau vient d'être réservé, merci d'en choisir un autre" });
    }

    const rdv = await Appointment.create({
      patientId: req.user.id,
      medecinId,
      date: dateHeure,
      motif,
      statut: 'confirme',
    });

    await creerNotification(
      req.user.id,
      'rendezvous',
      `Rendez-vous confirmé le ${date} à ${heure}`,
      `/appointments/${rdv._id}`
    );
    await creerNotification(
      medecinId,
      'rendezvous',
      `Nouveau rendez-vous le ${date} à ${heure}`,
      `/appointments/${rdv._id}`
    );

    return res.status(201).json({ message: 'Rendez-vous confirmé', rdv });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la prise de rendez-vous', error: error.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const filtre = req.user.role === 'medecin' ? { medecinId: req.user.id } : { patientId: req.user.id };
    const rdvs = await Appointment.find(filtre)
      .populate('patientId', 'nom prenom email photoUrl')
      .populate('medecinId', 'nom prenom email photoUrl')
      .sort({ date: 1 });

    return res.status(200).json({ rdvs });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous', error: error.message });
  }
};

const getUpcomingAppointmentAlerts = async (req, res) => {
  try {
    const maintenant = new Date();
    const dans24h = new Date(maintenant.getTime() + 24 * 60 * 60 * 1000);
    const dans1h = new Date(maintenant.getTime() + 60 * 60 * 1000);

    const filtre = req.user.role === 'medecin' ? { medecinId: req.user.id } : { patientId: req.user.id };

    const rdvsProches = await Appointment.find({
      ...filtre,
      statut: 'confirme',
      date: { $gte: maintenant, $lte: dans24h },
    })
      .populate('patientId', 'nom prenom')
      .populate('medecinId', 'nom prenom')
      .sort({ date: 1 });

    const rdvsAvecAlerte = rdvsProches.map((rdv) => ({
      rdv,
      alerte: rdv.date <= dans1h ? '1h' : '24h',
    }));

    return res.status(200).json({ rdvsAvecAlerte });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du calcul des alertes', error: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const rdv = await Appointment.findById(req.params.id);
    if (!rdv) return res.status(404).json({ message: 'Rendez-vous introuvable' });

    const estAutorise =
      rdv.patientId.toString() === req.user.id || rdv.medecinId.toString() === req.user.id;
    if (!estAutorise) return res.status(403).json({ message: 'Accès refusé' });

    rdv.statut = 'annule';
    await rdv.save();

    const dateStr = rdv.date.toISOString().slice(0, 10);
    const heureStr = rdv.date.toISOString().slice(11, 16);
    const autrePartieId =
      req.user.id === rdv.patientId.toString() ? rdv.medecinId : rdv.patientId;
    await creerNotification(
      autrePartieId,
      'rendezvous',
      `Le rendez-vous du ${dateStr} à ${heureStr} a été annulé`,
      `/appointments/${rdv._id}`
    );

    return res.status(200).json({ message: 'Rendez-vous annulé', rdv });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'annulation", error: error.message });
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
    const { date, heure } = req.body;
    const rdv = await Appointment.findOne({ _id: req.params.id, patientId: req.user.id });
    if (!rdv) return res.status(404).json({ message: 'Rendez-vous introuvable' });
    if (rdv.statut === 'annule') {
      return res.status(400).json({ message: 'Impossible de reporter un rendez-vous annulé' });
    }

    const nouvelleDateHeure = new Date(`${date}T${heure}:00.000Z`);

    const conflit = await Appointment.findOne({
      medecinId: rdv.medecinId,
      date: nouvelleDateHeure,
      statut: { $ne: 'annule' },
    });
    if (conflit) return res.status(409).json({ message: 'Ce créneau est déjà pris' });

    rdv.date = nouvelleDateHeure;
    rdv.statut = 'confirme';
    await rdv.save();

    await creerNotification(
      rdv.medecinId,
      'rendezvous',
      `Le patient a reporté son rendez-vous au ${date} à ${heure}`,
      `/appointments/${rdv._id}`
    );

    return res.status(200).json({ message: 'Rendez-vous reporté', rdv });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du report', error: error.message });
  }
};

const completeAppointment = async (req, res) => {
  try {
    const rdv = await Appointment.findOne({ _id: req.params.id, medecinId: req.user.id });
    if (!rdv) return res.status(404).json({ message: 'Rendez-vous introuvable' });

    rdv.statut = 'termine';
    await rdv.save();

    return res.status(200).json({ message: 'Rendez-vous marqué comme terminé', rdv });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getUpcomingAppointmentAlerts,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
};
