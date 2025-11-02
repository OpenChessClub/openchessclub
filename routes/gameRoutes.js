const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/new', requireAdmin, gameController.newGameForm);
router.post('/', requireAdmin, gameController.createGame);

module.exports = router;
