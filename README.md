# Odonnanci — Démarrage du projet (Phase 1)

Application mobile de gestion des médicaments, rappels de prise, planification de rendez-vous et reconnaissance d'ordonnances par IA.

## Ce qui est déjà en place dans ce squelette
- Backend Node.js/Express avec connexion MongoDB (Mongoose)
- 7 modèles de données : `User`, `PatientProfile`, `DoctorProfile`, `Medication`, `Prescription`, `Appointment`, `Reminder`
- `docker-compose.yml` (MongoDB + backend)
- Route de vérification `/api/health`

## Étapes pour démarrer

### 1. Lancer l'environnement avec Docker Compose
Depuis la racine du projet :
```bash
docker-compose up --build
```
Vérifier que l'API répond sur : http://localhost:5000/api/health



### 2. Générer le frontend Ionic (en local, hors conteneur)
```bash
npm install -g @ionic/cli
ionic start frontend blank --type=angular --capacitor
cd frontend
ionic serve
```



