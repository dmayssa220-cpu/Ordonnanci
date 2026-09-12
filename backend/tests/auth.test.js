const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Authentification', () => {
  const nouvelUtilisateur = {
    nom: 'Dridi',
    prenom: 'Maysoun',
    email: 'maysoun@test.com',
    motDePasse: 'motdepasse123',
    role: 'patient',
  };

  it('doit créer un nouveau compte patient', async () => {
    const res = await request(app).post('/api/auth/register').send(nouvelUtilisateur);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.email).toBe(nouvelUtilisateur.email);
  });

  it('doit refuser une inscription avec un email déjà utilisé', async () => {
    const res = await request(app).post('/api/auth/register').send(nouvelUtilisateur);
    expect(res.statusCode).toBe(409);
  });

  it('doit connecter un utilisateur avec les bons identifiants', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: nouvelUtilisateur.email, motDePasse: nouvelUtilisateur.motDePasse });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('doit refuser une connexion avec un mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: nouvelUtilisateur.email, motDePasse: 'mauvais_mdp' });
    expect(res.statusCode).toBe(401);
  });

  it('doit accéder au profil avec un token valide', async () => {
    const connexion = await request(app)
      .post('/api/auth/login')
      .send({ email: nouvelUtilisateur.email, motDePasse: nouvelUtilisateur.motDePasse });

    const res = await request(app)
      .get('/api/profile/me')
      .set('Authorization', `Bearer ${connexion.body.accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.utilisateur.email).toBe(nouvelUtilisateur.email);
  });

  it('doit refuser l\'accès au profil sans token', async () => {
    const res = await request(app).get('/api/profile/me');
    expect(res.statusCode).toBe(401);
  });
});
