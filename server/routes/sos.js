import express from 'express';
import * as sosController from '../controllers/sosController.js';

const router = express.Router();

router.post('/', sosController.triggerSOS);
router.get('/:id', sosController.getSOS);
router.get('/user/:userId', sosController.getUserSOS);
router.patch('/:id/status', sosController.updateSOSStatus);

export default router;
