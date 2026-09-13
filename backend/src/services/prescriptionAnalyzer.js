const Jimp = require('jimp');
const Tesseract = require('tesseract.js');
const { estUneLigneDeMedicament } = require('./aiClassifier');

/**
 * Prétraite l'image pour améliorer la qualité de l'OCR :
 * passage en niveaux de gris, augmentation du contraste, normalisation.
 */
const pretraiterImage = async (cheminImage) => {
  const image = await Jimp.read(cheminImage);
  image.grayscale().contrast(0.3).normalize();

  const cheminTraite = cheminImage.replace(/(\.\w+)$/, '-traite$1');
  await image.writeAsync(cheminTraite);
  return cheminTraite;
};

/**
 * Extrait le texte brut de l'image via Tesseract.js (OCR en français).
 * Note : au premier lancement, Tesseract.js télécharge les données du modèle
 * de langue ("fra.traineddata") — une connexion internet est nécessaire.
 */
const extraireTexte = async (cheminImage) => {
  const {
    data: { text },
  } = await Tesseract.recognize(cheminImage, 'fra');
  return text;
};

/**
 * Analyse le texte OCR ligne par ligne : le modèle TensorFlow.js filtre les
 * lignes qui ressemblent à une mention de médicament, puis des expressions
 * régulières extraient le dosage et la fréquence probable.
 */
const extraireMedicaments = (texteOCR) => {
  const lignes = texteOCR
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const medicamentsDetectes = [];

  lignes.forEach((ligne) => {
    if (!estUneLigneDeMedicament(ligne)) return;

    const dosageMatch = ligne.match(/(\d+[.,]?\d*)\s*(mg|g|ml)\b/i);
    const frequenceMatch = ligne.match(
      /(\d+\s*fois\s*par\s*jour)|(matin\s*(et\s*)?(midi\s*(et\s*)?)?soir)|matin|midi|soir/i
    );
    const nomMatch = ligne.match(/^([A-Za-zÀ-ÿ]+)/); // premier mot = nom probable du médicament

    medicamentsDetectes.push({
      nom: nomMatch ? nomMatch[1] : ligne,
      dosage: dosageMatch ? `${dosageMatch[1]}${dosageMatch[2]}` : null,
      frequence: frequenceMatch ? frequenceMatch[0] : null,
      ligneOriginale: ligne,
    });
  });

  return medicamentsDetectes;
};

module.exports = { pretraiterImage, extraireTexte, extraireMedicaments };
