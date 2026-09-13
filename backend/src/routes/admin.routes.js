const express = require('express');
const {
  listUsers,
  toggleUserStatus,
  deleteUser,
  listReferentiel,
  createReferentiel,
  updateReferentiel,
  deleteReferentiel,
  getStatistiques,
} = require('../controllers/admin.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(verifyToken, checkRole('admin'));

router.get('/users', listUsers);
router.patch('/users/:id/statut', toggleUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/referentiel-medicaments', listReferentiel);
router.post('/referentiel-medicaments', createReferentiel);
router.put('/referentiel-medicaments/:id', updateReferentiel);
router.delete('/referentiel-medicaments/:id', deleteReferentiel);

router.get('/statistiques', getStatistiques);

module.exports = router;
