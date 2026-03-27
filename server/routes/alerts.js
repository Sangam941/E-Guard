import express from 'express';
import * as alertController from '../controllers/alertController.js';

const router = express.Router();

router.get('/:userId', alertController.getAlerts);
router.get('/detail/:id', alertController.getAlertById);
router.patch('/:id/read', alertController.markAsRead);
router.patch('/user/:userId/read-all', alertController.markAllAsRead);

export default router;
