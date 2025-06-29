const mongoose = require('mongoose');
//No need to use mongoose.Schema because we are using the Schema class directly
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
    }
})

//Export the model and create a new collection called Item
module.exports = mongoose.model('Item', ItemSchema);