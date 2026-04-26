const express = require('express');
const router = express.Router();

const ChatController = require('../controllers/ChatController');
const auth = require('../middleware/auth');

router.get('/', auth, ChatController.getChats);
router.post('/chat/start', authMiddleware, ChatController.startChat);
router.get('/:chatId/messages', auth, ChatController.getMessages);

module.exports = router;