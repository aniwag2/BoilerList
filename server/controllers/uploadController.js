// server/controllers/uploadController.js
const Item = require('../models/Item');
const User = require('../models/User');

async function uploadItem(req, res) {
    // req.user will be populated by the auth middleware if a valid token is provided
    const userId = req.user ? req.user.id : null;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User not logged in.' });
    }

    //Get the item details from the request body
    const { name, price, description, category, email } = req.body;
    const image = req.file;

    //Check if all fields are present
    // Also check for the owner (userId) now
    if (!name || !price || !description || !category || !image || !email || !userId) {
        return res.status(400).json({ message: 'Please enter all required fields including user information.' });
    }

    try {
        const newItem = new Item({
            name,
            price,
            description,
            category,
            email,
            image: {
                contentType: image.mimetype,
                data: image.buffer,
            },
            owner: userId // <--- NEW: Associate the item with the logged-in user
        });

        await newItem.save();
        res.status(201).json({ message: 'Item uploaded successfully', item: newItem });
    } catch (error) {
        console.error("Error uploading item:", error); // Log the error for debugging
        res.status(500).json({ message: 'Error uploading item', error: error.message });
    }
}

module.exports = { uploadItem };