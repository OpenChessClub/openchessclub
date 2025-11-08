const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { setUser } = require('./middleware/authMiddleware');

const handleBarsHelpers  = require('./helpers/handlebars');

const playerRoutes = require('./routes/playerRoutes');
const gameRoutes = require('./routes/gameRoutes');
const homeController = require('./controllers/homeController');
const authRoutes = require('./routes/authRoutes');
const settingRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Mongo Connected');
    })
  .catch(err => console.error('MongoDB connection error:', err));

app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: handleBarsHelpers
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**** IMPORTANT ****
** Ensure that you change 'Session_Secret_Here' to something unique.
*****/
app.use(session({
  secret: process.env.SESSION_SECRET || 'Session_Secret_Here',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60,
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.use(setUser);

app.get('/', homeController.getHome);
app.use('/settings', settingRoutes);
app.use('/players', playerRoutes);
app.use('/games', gameRoutes);
app.use('/auth', authRoutes);

app.use((req, res) => {
  res.status(404).render('404', { 
    title: 'Page Not Found',
    message: `Sorry, the page you're looking for doesn't exist.`,
    layout: 'error'
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).render('500', { 
    title: 'Server Error',
    message: `Something went wrong on our end. Please try again later.`, 
    layout: 'error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});
