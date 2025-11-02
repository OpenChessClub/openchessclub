const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, settingsController.getSettings);
router.post('/', requireAdmin, settingsController.updateSettings);

router.post('/invite', requireAdmin, settingsController.inviteUser);

module.exports = router;
