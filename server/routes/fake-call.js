import express from 'express';
import * as fakeCallController from '../controllers/fakeCallController.js';

const router = express.Router();

router.post('/', fakeCallController.createFakeCall);
router.patch('/:id/stop', fakeCallController.stopFakeCall);
router.get('/user/:userId', fakeCallController.getUserFakeCalls);

export default router;
