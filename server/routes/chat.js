import express from 'express';
import {
  sendMessage,
  getChatHistory,
  getUserChats,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/user', getUserChats);
router.get('/:chatId', getChatHistory);

export default router;
