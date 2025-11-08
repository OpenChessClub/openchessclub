const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  clubName: { type: String, default: 'Open Chess Club' },
  showTopPlayers: { type: Boolean, default: true },
  showRecentGames: { type: Boolean, default: true },
  announcement: { type: String },
  showAnnouncement: { type: Boolean, default: false},
  logo: {
    data: { type: String },
    contentType: { type: String }
  },
  invitedEmails: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
