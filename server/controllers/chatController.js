// server/controllers/chatController.js
const Chat = require('../models/Chat');
const User = require('../models/User'); // Might be needed for populating user info, though likely handled by auth

// --- NEW FUNCTION: createNewChat ---
async function createNewChat(req, res) {
    const userId = req.user.id; // User ID from authenticated token

    try {
        const newChat = new Chat({
            userId: userId,
            title: 'New Chat' // Default title, client can update later
        });
        await newChat.save();
        res.status(201).json({ success: true, message: 'New chat created.', chat: newChat });
    } catch (error) {
        console.error('Error creating new chat:', error);
        res.status(500).json({ success: false, message: 'Server error creating new chat.' });
    }
}

// --- NEW FUNCTION: getUserChats ---
async function getUserChats(req, res) {
    const userId = req.user.id; // User ID from authenticated token

    try {
        // Fetch all chat sessions for the authenticated user, sorted by updatedAt (most recent first)
        const chats = await Chat.find({ userId: userId })
                                .sort({ updatedAt: -1 })
                                .select('_id title updatedAt') // Only return necessary fields for chat list
                                .lean();
        res.status(200).json({ success: true, chats: chats });
    } catch (error) {
        console.error('Error fetching user chats:', error);
        res.status(500).json({ success: false, message: 'Server error fetching chats.' });
    }
}

// --- NEW FUNCTION: getChatMessages ---
async function getChatMessages(req, res) {
    const { chatId } = req.params;
    const userId = req.user.id; // User ID from authenticated token

    try {
        const chat = await Chat.findOne({ _id: chatId, userId: userId }); // Find chat for specific user
        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found or unauthorized.' });
        }
        res.status(200).json({ success: true, messages: chat.messages });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ success: false, message: 'Server error fetching messages.' });
    }
}

// --- NEW FUNCTION: addMessageToChat ---
// This function will be called by your RAGController to save messages after AI processing
async function addMessageToChat(chatId, userId, sender, content) {
    try {
        const chat = await Chat.findOne({ _id: chatId, userId: userId });
        if (!chat) {
            console.warn(`Chat not found for ID ${chatId} and user ${userId}. Message not saved.`);
            return { success: false, message: 'Chat not found or unauthorized.' };
        }

        chat.messages.push({ sender, content });
        await chat.save();
        return { success: true, message: 'Message saved.', newMessage: chat.messages[chat.messages.length - 1] };
    } catch (error) {
        console.error('Error adding message to chat:', error);
        return { success: false, message: 'Server error saving message.' };
    }
}

// --- NEW FUNCTION: updateChatTitle ---
async function updateChatTitle(req, res) {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { newTitle } = req.body;

    if (!newTitle || newTitle.trim() === '') {
        return res.status(400).json({ success: false, message: 'New title cannot be empty.' });
    }

    try {
        const chat = await Chat.findOne({ _id: chatId, userId: userId });
        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found or unauthorized.' });
        }

        chat.title = newTitle.trim();
        await chat.save();
        res.status(200).json({ success: true, message: 'Chat title updated.', chat: chat });
    } catch (error) {
        console.error('Error updating chat title:', error);
        res.status(500).json({ success: false, message: 'Server error updating chat title.' });
    }
}

// --- NEW FUNCTION: deleteChat ---
async function deleteChat(req, res) {
    const { chatId } = req.params;
    const userId = req.user.id;

    try {
        const result = await Chat.deleteOne({ _id: chatId, userId: userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Chat not found or unauthorized.' });
        }
        res.status(200).json({ success: true, message: 'Chat deleted successfully.' });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ success: false, message: 'Server error deleting chat.' });
    }
}


module.exports = {
    createNewChat,
    getUserChats,
    getChatMessages,
    addMessageToChat, // This is an internal function, not directly exposed as a route
    updateChatTitle,
    deleteChat
};