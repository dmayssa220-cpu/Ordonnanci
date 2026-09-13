const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');

/**
 * ATTENTION — Modèle de démonstration.
 * Ce classifieur est entraîné à chaque démarrage du serveur sur un tout petit
 * jeu de données synthétique (voir DONNEES_ENTRAINEMENT ci-dessous). Il sert de
 * point de départ fonctionnel pour la Phase 5, mais devra être ré-entraîné sur
 * de vraies ordonnances annotées avant toute utilisation en production
 * (cf. cahier des charges, section "apprentissage continu").
 */

const VOCABULAIRE = [
  'mg', 'ml', 'g', 'comprime', 'comprimes', 'gelule', 'gelules', 'sirop', 'sachet', 'ampoule',
  'fois', 'jour', 'jours', 'matin', 'midi', 'soir', 'avant', 'apres', 'repas', 'pendant',
  'dose', 'dosage', 'posologie',
  'doliprane', 'paracetamol', 'ibuprofene', 'amoxicilline', 'aspirine', 'ventoline',
  'metformine', 'augmentin', 'spasfon', 'smecta', 'efferalgan', 'advil',
];

const normaliser = (texte) =>
  texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const vectoriser = (ligne) => {
  const texteNormalise = normaliser(ligne);
  return VOCABULAIRE.map((mot) => (texteNormalise.includes(mot) ? 1 : 0));
};

// Jeu de données synthétique minimal — À REMPLACER par de vraies ordonnances
// annotées dès que possible.
const DONNEES_ENTRAINEMENT = [
  { texte: 'Doliprane 1000mg 3 fois par jour', label: 1 },
  { texte: 'Paracetamol 500 mg matin et soir', label: 1 },
  { texte: 'Amoxicilline 1g 2 fois par jour pendant 7 jours', label: 1 },
  { texte: 'Ibuprofene 400mg avant repas', label: 1 },
  { texte: 'Ventoline 1 bouffee si besoin', label: 1 },
  { texte: 'Metformine 850mg matin et soir', label: 1 },
  { texte: 'Augmentin 1g 2 fois par jour', label: 1 },
  { texte: 'Spasfon 2 comprimes 3 fois par jour', label: 1 },
  { texte: 'Smecta 1 sachet matin midi soir', label: 1 },
  { texte: 'Efferalgan 500mg si douleur', label: 1 },
  { texte: 'Dr Ahmed Ben Ali - Cabinet medical', label: 0 },
  { texte: 'Ordonnance du 12/09/2026', label: 0 },
  { texte: 'Tunis, Ariana', label: 0 },
  { texte: 'Signature et cachet du medecin', label: 0 },
  { texte: 'Nom du patient : Mayssa Dridi', label: 0 },
  { texte: 'Numero de telephone 71 234 567', label: 0 },
  { texte: 'A renouveler dans un mois', label: 0 },
  { texte: 'Consultation de suivi', label: 0 },
];

let modele = null;

const entrainerModele = async () => {
  await tf.setBackend('cpu');
  await tf.ready();

  const xs = tf.tensor2d(DONNEES_ENTRAINEMENT.map((d) => vectoriser(d.texte)));
  const ys = tf.tensor2d(DONNEES_ENTRAINEMENT.map((d) => [d.label]));

  modele = tf.sequential();
  modele.add(tf.layers.dense({ units: 8, activation: 'relu', inputShape: [VOCABULAIRE.length] }));
  modele.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
  modele.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

  await modele.fit(xs, ys, { epochs: 50, verbose: 0 });

  xs.dispose();
  ys.dispose();

  console.log("Modèle TensorFlow.js de classification des lignes d'ordonnance entraîné");
};

const estUneLigneDeMedicament = (ligne) => {
  if (!modele) return false;
  const vecteur = vectoriser(ligne);
  const prediction = modele.predict(tf.tensor2d([vecteur]));
  const score = prediction.dataSync()[0];
  prediction.dispose();
  return score > 0.5;
};

module.exports = { entrainerModele, estUneLigneDeMedicament, VOCABULAIRE };
