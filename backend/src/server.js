require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { entrainerModele } = require('./services/aiClassifier');

const PORT = process.env.PORT || 5000;

const demarrer = async () => {
  await connectDB();
  await entrainerModele();
  app.listen(PORT, () => {
    console.log(`Serveur Odonnanci démarré sur le port ${PORT}`);
  });
};

demarrer();
