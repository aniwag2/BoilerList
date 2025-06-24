const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ensure usernames are unique
        trim: true,  // Remove whitespace from both ends of a string
        minlength: 3 // Minimum length for username
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure emails are unique
        trim: true,
        lowercase: true, // Store emails in lowercase for consistency
        match: [/.+@.+\..+/, 'Please enter a valid email address'] // Basic email regex validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimum length for password
    },
    // You can add more fields here, e.g., createdAt, updatedAt, role, etc.
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);