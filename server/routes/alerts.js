import express from 'express';
import {
  getAlerts,
  getAlertById,
  markAsRead,
  markAllAsRead,
} from '../controllers/alertsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Specific sub-paths must come BEFORE param-based routes
router.get('/detail/:id', getAlertById);
router.patch('/user/:userId/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.get('/', getAlerts);

export default router;
 