const express = require('express');
const router = express.Router();

const ChatController = require('../controllers/ChatController');
const auth = require('../middleware/auth');

// Chat list (WhatsApp home)
router.get('/', auth, ChatController.getChats);

// Messages
router.get('/:chatId/messages', auth, ChatController.getMessages);

module.exports = router;