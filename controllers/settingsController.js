const Settings = require('../models/Settings');
const User = require('../models/User');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  }
}).single('logo');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    const admins = await User.find({ role: 'admin' }).select('name email');

    res.render('admin/settings', { settings: settings.toObject(), admins });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading settings');
  }
};

exports.updateSettings = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).send(err.message);

    try {
      let settings = await Settings.findOne();
      if (!settings) settings = new Settings();

      settings.clubName = req.body.clubName || settings.clubName;
      settings.showTopPlayers = !!req.body.showTopPlayers;
      settings.showRecentGames = !!req.body.showRecentGames;
      settings.announcement = req.body.announcement;
      settings.showAnnouncement= !!req.body.showAnnouncement;

      if (req.file) {
        settings.logo.data = req.file.buffer.toString('base64');
        settings.logo.contentType = req.file.mimetype;
      }

      await settings.save();
      res.redirect('/settings');
    } 
    catch (e) {
      console.error(e);
      res.status(500).send('Error updating settings');
    }
  });
};

exports.inviteUser = async (req, res) => {
  try {
    const { inviteEmail } = req.body;
    if (!inviteEmail) return res.status(400).send('Email is required');

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    settings.invitedEmails.push(inviteEmail);
    await settings.save();

    res.redirect('/settings');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error inviting user');
  }
};
