// server/controllers/userController.js
const User = require('../models/User'); // Import User model
const Item = require('../models/Item'); // Import Item model

// Toggle favorite status for an item
const toggleFavorite = async (req, res) => {
    // req.user will be populated by the auth middleware
    const userId = req.user.id; // User ID from the authenticated token
    const { itemId } = req.body; // Item ID from the request body

    if (!itemId) {
        return res.status(400).json({ message: 'Item ID is required.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the item exists
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        const itemIndex = user.favorites.indexOf(itemId);

        if (itemIndex === -1) {
            // Item not in favorites, add it
            user.favorites.push(itemId);
            await user.save();
            return res.status(200).json({ message: 'Item added to favorites.', isFavorite: true });
        } else {
            // Item is in favorites, remove it
            user.favorites.splice(itemIndex, 1);
            await user.save();
            return res.status(200).json({ message: 'Item removed from favorites.', isFavorite: false });
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ message: 'Server error toggling favorite status.' });
    }
};

module.exports = {
    toggleFavorite,
};