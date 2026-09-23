const express = require('express');
const router = express.Router();
const { getAllMessages, getConversations, getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAllMessages);
router.get('/conversations', getConversations);
router.get('/:receiverId', getMessages);
router.post('/', sendMessage);

module.exports = router;
