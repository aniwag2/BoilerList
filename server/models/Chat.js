// server/models/Chat.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for individual chat messages
const MessageSchema = new Schema({
    sender: {
        type: String, // 'user' or 'bot'
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Define the schema for a chat session
const ChatSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    title: {
        type: String,
        required: true,
        default: 'New Chat' // A default title, can be updated later
    },
    messages: [MessageSchema], // Array of message sub-documents
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update 'updatedAt' timestamp on every save
ChatSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Chat', ChatSchema);