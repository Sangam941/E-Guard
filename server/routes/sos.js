import express from 'express';
import {
  triggerSOS,
  getSOSById,
  getUserSOS,
  updateSOSStatus,
  getFirstSOS,
} from '../controllers/sosController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', triggerSOS);
router.get('/first',getFirstSOS)
router.get('/user', getUserSOS);
router.get('/:id', getSOSById);
router.patch('/:id/status', updateSOSStatus);

export default router;
