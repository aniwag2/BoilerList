// server/models/Item.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        contentType: String,
        data: Buffer,
    },
    description: {
        type: String,
        required: true
    },
    email: { // You can keep this for display/contact, but it's not for ownership verification
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // --- NEW FIELD ---
    owner: {
        type: Schema.Types.ObjectId, // This indicates it's a MongoDB ObjectId
        ref: 'User', // This tells Mongoose it refers to documents in the 'User' collection
        required: true // An item must have an owner
    }
});

module.exports = mongoose.model('Item', ItemSchema);