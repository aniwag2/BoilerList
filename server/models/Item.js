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
    email: {
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
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isBestOffer: {
        type: Boolean,
        default: false
    },
    isUrgent: {
        type: Boolean,
        default: false
    },
    // --- NEW FIELD: interestedBuyers ---
    interestedBuyers: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true // Each interested buyer must have a user ID
        },
        username: {
            type: String,
            required: true // Store username for easier access in emails/display
        },
        email: {
            type: String,
            required: true // Store email for direct contact by seller
        },
        expressedAt: {
            type: Date,
            default: Date.now // Timestamp when interest was expressed
        }
    }]
});

module.exports = mongoose.model('Item', ItemSchema);