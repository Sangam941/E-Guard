const express = require('express');
const fakeCallController = require('../controllers/fakeCallController');

const router = express.Router();

router.post('/', fakeCallController.createFakeCall);
router.patch('/:id/stop', fakeCallController.stopFakeCall);
router.get('/user/:userId', fakeCallController.getUserFakeCalls);

module.exports = router;
