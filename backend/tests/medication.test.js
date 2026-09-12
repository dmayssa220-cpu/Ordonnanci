const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Reminder = require('../src/models/Reminder');

let mongoServer;
let accessToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const inscription = await request(app).post('/api/auth/register').send({
    nom: 'Dridi',
    prenom: 'Maysoun',
    email: 'patient@test.com',
    motDePasse: 'motdepasse123',
    role: 'patient',
  });
  accessToken = inscription.body.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Gestion des médicaments et rappels', () => {
  let medicationId;

  it('doit créer un médicament et générer les rappels associés', async () => {
    const res = await request(app)
      .post('/api/medications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nom: 'Doliprane',
        dosage: '1000mg',
        frequence: '2 fois par jour',
        heuresPrise: ['08:00', '20:00'],
        dateDebut: '2026-01-01',
        dateFin: '2026-01-02',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.medicament.nom).toBe('Doliprane');
    medicationId = res.body.medicament._id;

    const rappels = await Reminder.find({ medicationId });
    expect(rappels.length).toBe(4); // 2 jours x 2 heures de prise
  });

  it('doit rejeter la création si heuresPrise est manquant', async () => {
    const res = await request(app)
      .post('/api/medications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nom: 'Ibuprofène',
        dosage: '400mg',
        frequence: '1 fois par jour',
        dateDebut: '2026-01-01',
      });

    expect(res.statusCode).toBe(400);
  });

  it('doit lister les médicaments du patient connecté', async () => {
    const res = await request(app)
      .get('/api/medications')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.medicaments.length).toBe(1);
  });

  it('doit marquer un rappel comme pris', async () => {
    const rappel = await Reminder.findOne({ medicationId });

    const res = await request(app)
      .patch(`/api/reminders/${rappel._id}/statut`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ statut: 'pris' });

    expect(res.statusCode).toBe(200);
    expect(res.body.rappel.statut).toBe('pris');
  });

  it('doit refuser un statut de rappel invalide', async () => {
    const rappel = await Reminder.findOne({ medicationId });

    const res = await request(app)
      .patch(`/api/reminders/${rappel._id}/statut`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ statut: 'invalide' });

    expect(res.statusCode).toBe(400);
  });

  it("doit calculer le taux d'observance du médicament", async () => {
    const res = await request(app)
      .get(`/api/medications/${medicationId}/observance`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('tauxObservance');
  });

  it('doit supprimer un médicament et ses rappels associés', async () => {
    const res = await request(app)
      .delete(`/api/medications/${medicationId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);

    const rappelsRestants = await Reminder.find({ medicationId });
    expect(rappelsRestants.length).toBe(0);
  });
});
