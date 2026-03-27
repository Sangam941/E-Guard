import express from 'express';
import {
  createFakeCall,
  stopFakeCall,
  getUserFakeCalls,
} from '../controllers/fakeCallController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createFakeCall);
router.get('/user/:userId', getUserFakeCalls);
router.patch('/:id/stop', stopFakeCall);

export default router;
