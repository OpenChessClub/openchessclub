const Player = require('../models/Player');
const Game = require('../models/Game');
const { calculateGameRatings } = require('../lib/elo');
const getSettings = require('../lib/getSettings');

exports.listGames = async (req, res) => {
  const games = await Game.find()
    .populate('white_player', 'name slug')
    .populate('black_player', 'name slug')
    .sort({ played_at: -1 }).lean();
  res.render('games', { title: 'All Games', games });
};

exports.newGameForm = async (req, res) => {
  const players = await Player.find({ active: true }).sort({ name: 1 }).lean();
  const settings = await getSettings();
  res.render('game-form', { title: 'Record New Game', players, settings });
};

exports.createGame = async (req, res) => {
  const { white_player_slug, black_player_slug, result, notes } = req.body;
  if (white_player_slug === black_player_slug) {
    return res.status(400).send('Players must be different');
  }

  const white = await Player.findOne({ slug: white_player_slug });
  const black = await Player.findOne({ slug: black_player_slug });
  if (!white || !black) {
    return res.status(404).send('One or both players not found');
  }

  const ratings = calculateGameRatings(white.current_rating, black.current_rating, result);

  await Game.create({
    white_player: white._id,
    black_player: black._id,
    result,
    white_rating_before: white.current_rating,
    black_rating_before: black.current_rating,
    white_rating_after: ratings.whiteRatingAfter,
    black_rating_after: ratings.blackRatingAfter,
    white_rating_change: ratings.whiteRatingChange,
    black_rating_change: ratings.blackRatingChange,
    notes
  });

  const updateStats = (player, newRating, win, loss, draw) => {
    player.current_rating = newRating;
    player.peak_rating = Math.max(player.peak_rating, newRating);
    player.games_played += 1;
    player.wins += win;
    player.losses += loss;
    player.draws += draw;
    return player.save();
  };

  if (result === 'white_win') {
    await Promise.all([
      updateStats(white, ratings.whiteRatingAfter, 1, 0, 0),
      updateStats(black, ratings.blackRatingAfter, 0, 1, 0)
    ]);
  } else if (result === 'black_win') {
    await Promise.all([
      updateStats(white, ratings.whiteRatingAfter, 0, 1, 0),
      updateStats(black, ratings.blackRatingAfter, 1, 0, 0)
    ]);
  } else {
    await Promise.all([
      updateStats(white, ratings.whiteRatingAfter, 0, 0, 1),
      updateStats(black, ratings.blackRatingAfter, 0, 0, 1)
    ]);
  }

  if (req.headers['content-type'] === 'application/json' || req.xhr) {
    return res.json({ success: true, redirect: '/' });
  } 
  else {
    return res.redirect('/');
  }
};