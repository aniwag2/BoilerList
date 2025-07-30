// server/routes/chat.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import your authentication middleware
const chatController = require('../controllers/chatController'); // Import the new chat controller

// All chat routes will be protected by the auth middleware

// POST /api/chat/new - Create a new chat session
router.post('/new', auth, chatController.createNewChat);

// GET /api/chat - Get all chat sessions for the authenticated user
router.get('/', auth, chatController.getUserChats);

// GET /api/chat/:chatId - Get all messages for a specific chat session
router.get('/:chatId', auth, chatController.getChatMessages);

// PUT /api/chat/:chatId/title - Update the title of a chat session
router.put('/:chatId/title', auth, chatController.updateChatTitle);

// DELETE /api/chat/:chatId - Delete a specific chat session
router.delete('/:chatId', auth, chatController.deleteChat);

module.exports = router;