require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const User = require('../models/User');

const creerAdminParDefaut = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || 'admin@odonnanci.com';
  const motDePasse = process.env.ADMIN_PASSWORD || 'admin123456';

  const existant = await User.findOne({ email });
  if (existant) {
    console.log('Un compte admin existe déjà avec cet email :', email);
    process.exit(0);
  }

  const motDePasseHash = await bcrypt.hash(motDePasse, 10);
  await User.create({
    nom: 'Admin',
    prenom: 'Odonnanci',
    email,
    motDePasseHash,
    role: 'admin',
  });

  console.log('Compte admin créé avec succès :', email);
  console.log('⚠️  Pense à changer le mot de passe après la première connexion.');
  process.exit(0);
};

creerAdminParDefaut();
