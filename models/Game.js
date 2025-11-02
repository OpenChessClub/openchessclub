const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  white_player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  black_player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  result: { type: String, enum: ['white_win', 'black_win', 'draw'], required: true },
  white_rating_before: Number,
  black_rating_before: Number,
  white_rating_after: Number,
  black_rating_after: Number,
  white_rating_change: Number,
  black_rating_change: Number,
  notes: String,
  played_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);