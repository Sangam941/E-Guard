import express from 'express';
import * as chatController from '../controllers/chatController.js';

const router = express.Router();

router.post('/', chatController.sendMessage);
router.get('/:chatId', chatController.getChatHistory);
router.get('/user/:userId', chatController.getUserChats);

export default router;
 