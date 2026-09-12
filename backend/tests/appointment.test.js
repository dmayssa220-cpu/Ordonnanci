const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const { JOURS_SEMAINE } = require('../src/utils/creneaux');

let mongoServer;
let tokenPatient;
let tokenMedecin;
let medecinId;

// On choisit une date de test et on en déduit le jour de la semaine correspondant,
// pour rester cohérent quelle que soit la date réelle d'exécution des tests.
const dateTest = '2026-09-14';
const jourTest = JOURS_SEMAINE[new Date(dateTest).getDay()];

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

  // Le médecin déclare ses disponibilités pour le jour testé, de 9h à 10h (2 créneaux de 30 min)
  await request(app)
    .put('/api/profile/me')
    .set('Authorization', `Bearer ${tokenMedecin}`)
    .send({ disponibilites: [{ jour: jourTest, heureDebut: '09:00', heureFin: '10:00' }] });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Recherche de médecins et créneaux', () => {
  it('doit trouver le médecin par spécialité', async () => {
    const res = await request(app)
      .get('/api/doctors?specialite=cardio')
      .set('Authorization', `Bearer ${tokenPatient}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.medecins.length).toBe(1);
  });

  it('doit renvoyer les créneaux disponibles pour la date testée', async () => {
    const res = await request(app)
      .get(`/api/doctors/${medecinId}/creneaux?date=${dateTest}`)
      .set('Authorization', `Bearer ${tokenPatient}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.creneaux).toEqual(['09:00', '09:30']);
  });
});

describe('Prise, report et annulation de rendez-vous', () => {
  let appointmentId;

  it('doit créer un rendez-vous sur un créneau disponible', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${tokenPatient}`)
      .send({ medecinId, date: dateTest, heure: '09:00', motif: 'Consultation de routine' });

    expect(res.statusCode).toBe(201);
    appointmentId = res.body.rdv._id;
  });

  it('doit refuser un second rendez-vous sur le même créneau', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${tokenPatient}`)
      .send({ medecinId, date: dateTest, heure: '09:00', motif: 'Doublon' });

    expect(res.statusCode).toBe(409);
  });

  it('doit retirer le créneau réservé de la liste des disponibilités', async () => {
    const res = await request(app)
      .get(`/api/doctors/${medecinId}/creneaux?date=${dateTest}`)
      .set('Authorization', `Bearer ${tokenPatient}`);

    expect(res.body.creneaux).toEqual(['09:30']);
  });

  it('doit lister le rendez-vous côté patient et côté médecin', async () => {
    const resPatient = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${tokenPatient}`);
    expect(resPatient.body.rdvs.length).toBe(1);

    const resMedecin = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${tokenMedecin}`);
    expect(resMedecin.body.rdvs.length).toBe(1);
  });

  it('doit reporter le rendez-vous vers un autre créneau', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/reporter`)
      .set('Authorization', `Bearer ${tokenPatient}`)
      .send({ date: dateTest, heure: '09:30' });

    expect(res.statusCode).toBe(200);
    expect(res.body.rdv.statut).toBe('confirme');
  });

  it('doit annuler le rendez-vous', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/annuler`)
      .set('Authorization', `Bearer ${tokenPatient}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.rdv.statut).toBe('annule');
  });

  it('doit de nouveau libérer les deux créneaux après annulation', async () => {
    const res = await request(app)
      .get(`/api/doctors/${medecinId}/creneaux?date=${dateTest}`)
      .set('Authorization', `Bearer ${tokenPatient}`);

    expect(res.body.creneaux).toEqual(['09:00', '09:30']);
  });
});
