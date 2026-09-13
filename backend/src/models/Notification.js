const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['rappel_medicament', 'rappel_rendezvous', 'rendezvous', 'systeme'],
      required: true,
    },
    message: { type: String, required: true },
    lien: { type: String },
    lu: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
