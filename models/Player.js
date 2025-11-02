const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  current_rating: { type: Number, default: 1200 },
  peak_rating: { type: Number, default: 1200 },
  games_played: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  slug: { type: String, required: true },
  chesscom: { type: String, required: false },
  lichess: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);

