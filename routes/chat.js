const express = require('express');
const ChatController = require('../controllers/ChatController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, ChatController.getChats);
router.get('/:chatId/messages', auth, ChatController.getMessages);

module.exports = router;
