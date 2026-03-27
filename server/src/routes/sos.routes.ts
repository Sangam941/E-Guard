import { Router } from 'express';
import { SOSController } from '../controllers/sosController.js';

const router = Router();

router.post('/activate', SOSController.activate);
router.post('/deactivate', SOSController.deactivate);
router.get('/status', SOSController.getStatus);

export default router;
