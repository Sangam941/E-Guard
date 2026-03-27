const express = require('express');
const alertController = require('../controllers/alertController');

const router = express.Router();

router.get('/:userId', alertController.getAlerts);
router.get('/detail/:id', alertController.getAlertById);
router.patch('/:id/read', alertController.markAsRead);
router.patch('/user/:userId/read-all', alertController.markAllAsRead);

module.exports = router;
