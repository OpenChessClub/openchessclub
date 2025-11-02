const Settings = require('../models/Settings');

async function getSettings() {
  try {
    const settings = await Settings.findOne().lean();
    return settings || { clubName: 'Open Chess Club', showTopPlayers: true, showRecentGames: true };
  } 
  catch (err) {
    console.error('Error loading settings:', err);
    return { clubName: 'Open Chess Club', showTopPlayers: true, showRecentGames: true };
  }
}

module.exports = getSettings;
