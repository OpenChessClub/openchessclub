const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', playerController.listPlayers);
router.get('/new', requireAdmin, playerController.newPlayerForm);
router.post('/', requireAdmin, playerController.createPlayer);
router.get('/:slug', playerController.viewPlayer);
router.get('/:slug/edit', requireAdmin, playerController.editPlayerForm);
router.post('/:slug/update', requireAdmin, playerController.updatePlayer);

module.exports = router;