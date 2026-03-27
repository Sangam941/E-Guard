const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.post('/', chatController.sendMessage);
router.get('/:chatId', chatController.getChatHistory);
router.get('/user/:userId', chatController.getUserChats);

module.exports = router;
