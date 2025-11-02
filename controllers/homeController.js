const Player = require('../models/Player');
const Game = require('../models/Game');
const Settings = require('../models/Settings');

exports.getHome = async (req, res) => {
  try {
    const m = 10;
    const prior = 1200;

    const [
      players,
      settings,
      recentGames,
      games,
      totalPlayers,
      totalGames,
      topAdjustedPlayers
    ] = await Promise.all([
      Player.find({ games_played: { $gt: 0 } })
        .sort({ current_rating: -1 })
        .limit(10)
        .lean(),

      Settings.findOne().lean(),

      // 10 most recent games to be displayed
      Game.find()
        .populate('white_player', 'name slug')
        .populate('black_player', 'name slug')
        .sort({ played_at: -1 })
        .limit(10)
        .lean(),

      // All games. This will eventually get rather large.
      // todo: optimize
      Game.find()
        .populate('white_player', 'name slug')
        .populate('black_player', 'name slug')
        .sort({ played_at: -1 })
        .lean(),

      Player.countDocuments(),
      Game.countDocuments(),

      Player.aggregate([
        { $addFields: { games_played_num: { $ifNull: ["$games_played", 0] } } },
        {
          $addFields: {
            adjusted_rating: {
              $add: [
                {
                  $multiply: [
                    { $divide: ["$games_played_num", { $add: ["$games_played_num", m] }] },
                    { $ifNull: ["$current_rating", prior] }
                  ]
                },
                {
                  $multiply: [
                    { $divide: [m, { $add: ["$games_played_num", m] }] },
                    prior
                  ]
                }
              ]
            }
          }
        },
        { $sort: { adjusted_rating: -1, games_played_num: -1, current_rating: -1 } },
        { $limit: 10 },
        { $project: { games_played_num: 0 } }
      ])
    ]);

    res.render('home', {
      title: settings?.clubName || 'Open Chess Club',
      players,
      recentGames,
      allPlayers: topAdjustedPlayers,
      games,
      settings,
      stats: { totalPlayers, totalGames }
    });
  } 
  catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};
