import express from 'express';
import {
  triggerSOS,
  getSOSById,
  getUserSOS,
  updateSOSStatus,
} from '../controllers/sosController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', triggerSOS);
router.get('/user/:userId', getUserSOS);
router.get('/:id', getSOSById);
router.patch('/:id/status', updateSOSStatus);

export default router;
