const User = require('../models/User');
const { forbidden } = require('../controllers/forbiddenController');

exports.setUser = (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return forbidden(req, res);
  }
  next();
};
