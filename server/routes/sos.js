const express = require('express');
const sosController = require('../controllers/sosController');

const router = express.Router();

router.post('/', sosController.triggerSOS);
router.get('/:id', sosController.getSOS);
router.get('/user/:userId', sosController.getUserSOS);
router.patch('/:id/status', sosController.updateSOSStatus);

module.exports = router;
