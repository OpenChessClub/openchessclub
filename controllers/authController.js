const User = require('../models/User');
const getSettings = require('../lib/getSettings');

exports.loginForm = async (req, res) => {
  const settings = await getSettings();
  res.render('auth/login', { title: 'Login', settings });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.render('auth/login', { error: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.render('auth/login', { error: 'Invalid email or password' });

    req.session.user = {
      _id: user._id,
      name: user.name,
      role: user.role
    };

    res.redirect('/');
  }
  catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('/auth/login');
  });
};

exports.signupForm = (req, res) => {
  res.render('signup', { title: 'Sign Up' });
};

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.render('signup', { error: 'Email already in use' });

    const user = await User.create({ name, email, password, role: 'admin' });

    req.session.user = {
      _id: user._id,
      name: user.name,
      role: user.role
    };

    res.redirect('/');
  } 
  catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};