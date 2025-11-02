const Player = require('../models/Player');
const Game = require('../models/Game');
const getSettings = require('../lib/getSettings');

exports.listPlayers = async (req, res) => {
  const m = 10;
  const prior = 1200;

  const players = await Player.aggregate([
    { $addFields: {
        games_played_num: { $ifNull: ["$games_played", 0] }
      }
    },

    { $addFields: {
        adjusted_rating: {
          $add: [
            { $multiply: [
                { $divide: ["$games_played_num", { $add: ["$games_played_num", m] }] },
                { $ifNull: ["$current_rating", prior] }
              ]
            },
            { $multiply: [
                { $divide: [m, { $add: ["$games_played_num", m] }] },
                prior
              ]
            }
          ]
        }
      }
    },

    { $sort: { adjusted_rating: -1, games_played_num: -1, current_rating: -1 } },
    { $project: { games_played_num: 0 } }
  ]).exec();

  res.render('players', { title: 'All Players', players });
};


exports.newPlayerForm = (req, res) => {
  res.render('player-form', { title: 'Add New Player', action: '/players', player: {} });
};

exports.createPlayer = async (req, res) => {
  const { name, email, current_rating, chesscom, lichess } = req.body;

  if (!name || name.trim().split(/\s+/).length < 2) {
    return res.status(400).send('Please provide both first and last name.');
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-'); 

  const rating = parseInt(current_rating) || 1200;
  const existing = await Player.findOne({ slug });

  if (existing) {
    return res.status(400).send('A player with that name already exists.');
  }

  await Player.create({ name, email, current_rating: rating, peak_rating: rating, slug, chesscom, lichess });
  res.redirect('/');
};

exports.viewPlayer = async (req, res) => {
  try {
    const player = await Player.findOne({ slug: req.params.slug }).lean();
    const settings = await getSettings();

    if (!player) return res.status(404).send('Player not found');

    const games = await Game.find({
      $or: [{ white_player: player._id }, { black_player: player._id }]
    })
      .populate('white_player', 'name slug')
      .populate('black_player', 'name slug')
      .sort({ played_at: -1 });

    const formattedGames = games.map(g => {
      const isWhite = g.white_player._id.equals(player._id);
      return {
        ...g.toObject(),
        playerColor: isWhite ? 'white' : 'black',
        playerRatingBefore: isWhite ? g.white_rating_before : g.black_rating_before,
        playerRatingAfter: isWhite ? g.white_rating_after : g.black_rating_after,
        playerRatingChange: isWhite ? g.white_rating_change : g.black_rating_change,
        opponent: isWhite ? g.black_player.name : g.white_player.name
      };
    });

    const winPercentage = player.games_played
      ? ((player.wins / player.games_played) * 100).toFixed(1)
      : 0;

    res.render('player-detail', {
      title: player.name,
      player,
      games: formattedGames,
      settings,
      winPercentage
    });
  } 
  catch (err) {
    console.error(err);
    res.status(500).send('Server error while viewing player.');
  }
};


exports.editPlayerForm = async (req, res) => {
  const player = await Player.findOne({ slug: req.params.slug }).lean();
  const settings = await getSettings();

  if (!player) return res.status(404).send('Player not found');
  res.render('player-form', { title: 'Edit Player', action: `/players/${player.slug}/update`, player, settings });
};

exports.updatePlayer = async (req, res) => {
  try {
    const { name, email, current_rating, active, chesscom, lichess } = req.body;
    const player = await Player.findOne({ slug: req.params.slug });
    if (!player) return res.status(404).send('Player not found');

    player.name = name;
    player.email = email;
    player.current_rating = parseInt(current_rating) || player.current_rating;
    player.active = active === 'on';
    player.chesscom = chesscom;
    player.lichess = lichess;

    const newSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    player.slug = newSlug;

    await player.save();
    res.redirect(`/players/${player.slug}`);
  } 
  catch (err) {
    console.error(err);
    res.status(500).send('Error updating player.');
  }
};
