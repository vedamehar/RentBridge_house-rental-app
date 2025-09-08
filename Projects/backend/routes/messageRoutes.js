const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Send a message
router.post('/', messageController.sendMessage);

// Get conversation with specific user
router.get('/conversation/:userId', messageController.getConversation);

// Get all conversations for current user
router.get('/conversations', messageController.getConversations);

module.exports = router;
