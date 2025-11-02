const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many login attempts.',
    standardHeaders: true,
    legacyHeaders: false
});

router.get('/login', authController.loginForm);
router.post('/login', loginLimiter, authController.login);

router.get('/logout', authController.logout);

// router.get('/signup', authController.signupForm);
// router.post('/signup', authController.signup);

module.exports = router;
