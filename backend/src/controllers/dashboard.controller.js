const PDFDocument = require('pdfkit');
const Medication = require('../models/Medication');
const Appointment = require('../models/Appointment');
const Reminder = require('../models/Reminder');
const User = require('../models/User');

const getPatientDashboard = async (req, res) => {
  try {
    const maintenant = new Date();

    const traitementsEnCours = await Medication.find({
      patientId: req.user.id,
      dateFin: { $gte: maintenant },
    });

    const prochainsRendezVous = await Appointment.find({
      patientId: req.user.id,
      statut: 'confirme',
      date: { $gte: maintenant },
    })
      .populate('medecinId', 'nom prenom')
      .sort({ date: 1 })
      .limit(5);

    const rappelsEchus = await Reminder.find({ patientId: req.user.id, date: { $lte: maintenant } });
    const totalEchus = rappelsEchus.length;
    const nombrePris = rappelsEchus.filter((r) => r.statut === 'pris').length;
    const tauxObservanceGlobal = totalEchus > 0 ? Math.round((nombrePris / totalEchus) * 100) : null;

    return res.status(200).json({ traitementsEnCours, prochainsRendezVous, tauxObservanceGlobal });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du chargement du tableau de bord', error: error.message });
  }
};

const getDoctorDashboard = async (req, res) => {
  try {
    const maintenant = new Date();
    const debutJournee = new Date(maintenant);
    debutJournee.setHours(0, 0, 0, 0);
    const finJournee = new Date(maintenant);
    finJournee.setHours(23, 59, 59, 999);

    const agendaDuJour = await Appointment.find({
      medecinId: req.user.id,
      date: { $gte: debutJournee, $lte: finJournee },
      statut: { $ne: 'annule' },
    })
      .populate('patientId', 'nom prenom')
      .sort({ date: 1 });

    const idsPatients = await Appointment.find({ medecinId: req.user.id }).distinct('patientId');

    // Alertes d'inobservance : patients dont le taux d'observance global est inférieur à 50 %
    const alertesInobservance = [];
    for (const patientId of idsPatients) {
      const rappelsEchus = await Reminder.find({ patientId, date: { $lte: maintenant } });
      if (rappelsEchus.length === 0) continue;

      const nombrePris = rappelsEchus.filter((r) => r.statut === 'pris').length;
      const taux = Math.round((nombrePris / rappelsEchus.length) * 100);
      if (taux < 50) {
        const patient = await User.findById(patientId).select('nom prenom');
        alertesInobservance.push({ patient, tauxObservance: taux });
      }
    }

    return res.status(200).json({ agendaDuJour, nombrePatients: idsPatients.length, alertesInobservance });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du chargement du tableau de bord', error: error.message });
  }
};

const exportHistoriquePDF = async (req, res) => {
  try {
    const medicaments = await Medication.find({ patientId: req.user.id }).sort({ dateDebut: -1 });
    const rdvs = await Appointment.find({ patientId: req.user.id })
      .populate('medecinId', 'nom prenom')
      .sort({ date: -1 });

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=historique-medical.pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Historique médical — Odonnanci', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text('Médicaments');
    doc.moveDown(0.5);
    if (medicaments.length === 0) {
      doc.fontSize(11).text('Aucun médicament enregistré.');
    }
    medicaments.forEach((m) => {
      const debut = m.dateDebut ? m.dateDebut.toISOString().slice(0, 10) : 'N/A';
      const fin = m.dateFin ? m.dateFin.toISOString().slice(0, 10) : 'N/A';
      doc.fontSize(11).text(`- ${m.nom} (${m.dosage}) — ${m.frequence} — du ${debut} au ${fin}`);
    });

    doc.moveDown();
    doc.fontSize(14).text('Rendez-vous');
    doc.moveDown(0.5);
    if (rdvs.length === 0) {
      doc.fontSize(11).text('Aucun rendez-vous enregistré.');
    }
    rdvs.forEach((r) => {
      const nomMedecin = r.medecinId ? `Dr ${r.medecinId.prenom} ${r.medecinId.nom}` : 'Médecin inconnu';
      const dateAffichee = r.date.toISOString().slice(0, 16).replace('T', ' ');
      doc.fontSize(11).text(`- ${dateAffichee} avec ${nomMedecin} — statut : ${r.statut}`);
    });

    doc.end();
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la génération du PDF', error: error.message });
  }
};

module.exports = { getPatientDashboard, getDoctorDashboard, exportHistoriquePDF };
