const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Notification = require('../src/models/Notification');

let mongoServer;
let tokenPatient;
let tokenMedecin;
let tokenAdmin;
let medecinId;
let patientId;

// Trouve la prochaine date correspondant à un jour de semaine donné (0=dimanche ... 6=samedi)
const prochainJour = (jourCible) => {
  const date = new Date();
  const diff = (jourCible + 7 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const patient = await request(app).post('/api/auth/register').send({
    nom: 'Dridi',
    prenom: 'Maysoun',
    email: 'patient@test.com',
    motDePasse: 'motdepasse123',
    role: 'patient',
  });
  tokenPatient = patient.body.accessToken;
  patientId = patient.body.user.id;

  const medecin = await request(app).post('/api/auth/register').send({
    nom: 'Ben Salah',
    prenom: 'Amine',
    email: 'medecin@test.com',
    motDePasse: 'motdepasse123',
    role: 'medecin',
    specialite: 'Cardiologie',
  });
  tokenMedecin = medecin.body.accessToken;
  medecinId = medecin.body.user.id;

  // Compte admin créé directement en base (pas d'inscription publique pour ce rôle)
  const motDePasseHash = await bcrypt.hash('admin123456', 10);
  await User.create({ nom: 'Admin', prenom: 'Odonnanci', email: 'admin@test.com', motDePasseHash, role: 'admin' });
  const connexionAdmin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', motDePasse: 'admin123456' });
  tokenAdmin = connexionAdmin.body.accessToken;

  await request(app)
    .put('/api/profile/me')
    .set('Authorization', `Bearer ${tokenMedecin}`)
    .send({ disponibilites: [{ jour: 'lundi', heureDebut: '09:00', heureFin: '10:00' }] });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Notifications', () => {
  let appointmentId;

  it('doit créer une notification pour le patient et pour le médecin à la prise de RDV', async () => {
    const dateLundi = prochainJour(1);
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${tokenPatient}`)
      .send({ medecinId, date: dateLundi, heure: '09:00', motif: 'Contrôle' });

    expect(res.statusCode).toBe(201);
    appointmentId = res.body.rdv._id;

    const notifsPatient = await Notification.find({ userId: patientId });
    const notifsMedecin = await Notification.find({ userId: medecinId });
    expect(notifsPatient.length).toBeGreaterThan(0);
    expect(notifsMedecin.length).toBeGreaterThan(0);
  });

  it('doit lister les notifications via l\u2019API', async () => {
    const res = await request(app).get('/api/notifications').set('Authorization', `Bearer ${tokenPatient}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.notifications.length).toBeGreaterThan(0);
  });

  it('doit marquer toutes les notifications comme lues', async () => {
    const res = await request(app)
      .patch('/api/notifications/lire-tout')
      .set('Authorization', `Bearer ${tokenPatient}`);
    expect(res.statusCode).toBe(200);

    const notifs = await Notification.find({ userId: patientId });
    expect(notifs.every((n) => n.lu)).toBe(true);
  });

  it('doit respecter la préférence de désactivation des rappels de RDV', async () => {
    await request(app)
      .put('/api/notifications/preferences')
      .set('Authorization', `Bearer ${tokenPatient}`)
      .send({ rappelsRendezVous: false });

    const avant = await Notification.countDocuments({ userId: patientId });
    await request(app)
      .patch(`/api/appointments/${appointmentId}/annuler`)
      .set('Authorization', `Bearer ${tokenMedecin}`);
    const apres = await Notification.countDocuments({ userId: patientId });

    expect(apres).toBe(avant);
  });
});

describe('Tableaux de bord', () => {
  it('doit renvoyer le dashboard patient', async () => {
    const res = await request(app).get('/api/dashboard/patient').set('Authorization', `Bearer ${tokenPatient}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('tauxObservanceGlobal');
  });

  it('doit renvoyer le dashboard médecin', async () => {
    const res = await request(app).get('/api/dashboard/medecin').set('Authorization', `Bearer ${tokenMedecin}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('agendaDuJour');
  });

  it('doit refuser le dashboard patient à un médecin', async () => {
    const res = await request(app).get('/api/dashboard/patient').set('Authorization', `Bearer ${tokenMedecin}`);
    expect(res.statusCode).toBe(403);
  });

  it('doit générer un export PDF de l\u2019historique', async () => {
    const res = await request(app)
      .get('/api/dashboard/patient/export-pdf')
      .set('Authorization', `Bearer ${tokenPatient}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
  });
});

describe('Back-office admin', () => {
  it('doit lister les utilisateurs', async () => {
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.utilisateurs.length).toBeGreaterThanOrEqual(3);
  });

  it('doit refuser l\u2019accès admin à un patient', async () => {
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${tokenPatient}`);
    expect(res.statusCode).toBe(403);
  });

  it('doit suspendre puis réactiver un compte', async () => {
    const suspension = await request(app)
      .patch(`/api/admin/users/${patientId}/statut`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(suspension.body.utilisateur.estActif).toBe(false);

    const reactivation = await request(app)
      .patch(`/api/admin/users/${patientId}/statut`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(reactivation.body.utilisateur.estActif).toBe(true);
  });

  it('doit ajouter un médicament au référentiel', async () => {
    const res = await request(app)
      .post('/api/admin/referentiel-medicaments')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nom: 'Doliprane', dosagesDisponibles: ['500mg', '1000mg'], interactionsConnues: [] });

    expect(res.statusCode).toBe(201);
  });

  it('doit refuser un doublon dans le référentiel', async () => {
    const res = await request(app)
      .post('/api/admin/referentiel-medicaments')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nom: 'Doliprane', dosagesDisponibles: ['1000mg'] });

    expect(res.statusCode).toBe(409);
  });

  it('doit renvoyer les statistiques globales', async () => {
    const res = await request(app).get('/api/admin/statistiques').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.utilisateurs.nombrePatients).toBeGreaterThanOrEqual(1);
  });
});
