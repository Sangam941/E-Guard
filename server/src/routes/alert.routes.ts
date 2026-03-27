import { Router } from 'express';
import { AlertController } from '../controllers/alertController.js';

const router = Router();

router.get('/', AlertController.getAll);
router.get('/:alertId', AlertController.get);

export default router;
