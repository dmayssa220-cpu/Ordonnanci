const { entrainerModele, estUneLigneDeMedicament } = require('../src/services/aiClassifier');
const { extraireMedicaments } = require('../src/services/prescriptionAnalyzer');

beforeAll(async () => {
  await entrainerModele();
}, 20000);

describe("Classification des lignes d'ordonnance (TensorFlow.js)", () => {
  it('doit reconnaître une ligne de médicament typique', () => {
    expect(estUneLigneDeMedicament('Doliprane 1000mg 3 fois par jour')).toBe(true);
  });

  it("doit reconnaître une ligne de médicament non vue à l'entraînement", () => {
    expect(estUneLigneDeMedicament('Ibuprofene 400mg matin et soir')).toBe(true);
  });

  it("doit rejeter une ligne qui n'est pas un médicament", () => {
    expect(estUneLigneDeMedicament('Dr Ahmed Ben Ali - Cabinet medical')).toBe(false);
  });

  it('doit rejeter une ligne administrative', () => {
    expect(estUneLigneDeMedicament('Signature et cachet du medecin')).toBe(false);
  });
});

describe('Extraction des médicaments depuis un texte OCR simulé', () => {
  it('doit extraire nom, dosage et fréquence, et ignorer les lignes non pertinentes', () => {
    const texteSimule = `Ordonnance du 12/09/2026
Dr Ahmed Ben Ali - Cabinet medical
Doliprane 1000mg 3 fois par jour
Ibuprofene 400mg matin et soir
Signature et cachet du medecin`;

    const resultats = extraireMedicaments(texteSimule);

    expect(resultats.length).toBe(2);
    expect(resultats[0].nom).toBe('Doliprane');
    expect(resultats[0].dosage).toBe('1000mg');
    expect(resultats[1].nom).toBe('Ibuprofene');
    expect(resultats[1].dosage).toBe('400mg');
  });
});
