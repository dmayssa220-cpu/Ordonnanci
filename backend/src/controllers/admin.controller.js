const User = require('../models/User');

const listUsers = async (req, res) => {
  try {
    const utilisateurs = await User.find().select('-motDePasseHash');
    return res.status(200).json({ utilisateurs });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: error.message });
  }
};

module.exports = { listUsers };
