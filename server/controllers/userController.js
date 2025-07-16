// server/controllers/userController.js
const User = require('../models/User');
const Item = require('../models/Item'); // Import Item model to clean up listings
const bcrypt = require('bcryptjs'); // For password hashing/comparison
const jwt = require('jsonwebtoken'); // To invalidate token on password change/account delete

// Toggle favorite status for an item
const toggleFavorite = async (req, res) => {
    const userId = req.user.id;
    const { itemId } = req.body;

    if (!itemId) {
        return res.status(400).json({ message: 'Item ID is required.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        const itemIndex = user.favorites.indexOf(itemId);

        if (itemIndex === -1) {
            user.favorites.push(itemId);
            await user.save();
            return res.status(200).json({ message: 'Item added to favorites.', isFavorite: true });
        } else {
            user.favorites.splice(itemIndex, 1);
            await user.save();
            return res.status(200).json({ message: 'Item removed from favorites.', isFavorite: false });
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ message: 'Server error toggling favorite status.' });
    }
};

// --- NEW FUNCTION: Change Password ---
const changePassword = async (req, res) => {
    const userId = req.user.id; // From auth middleware
    const { currentPassword, newPassword } = req.body;

    // Input validation
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide both current and new passwords.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Compare current password with stored hashed password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password.' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        // Optional: Invalidate user's current token or issue a new one
        // For simplicity, we'll tell the client to log out and re-login,
        // which effectively invalidates the old token client-side.
        res.json({ success: true, message: 'Password changed successfully. Please log in again with your new password.' });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error changing password.' });
    }
};

// --- NEW FUNCTION: Delete Account ---
const deleteAccount = async (req, res) => {
    const userId = req.user.id; // From auth middleware

    try {
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // 1. Delete all listings created by this user
        await Item.deleteMany({ owner: userId });

        // 2. Remove this user from other users' favorite lists (if applicable)
        // This might be a heavy operation for many users/favorites
        await User.updateMany(
            { favorites: { $in: await Item.find({ owner: userId }, '_id') } }, // Find items owned by this user
            { $pull: { favorites: { $in: await Item.find({ owner: userId }, '_id') } } } // Pull those item IDs from favorites
        );
        // Simpler, but less efficient if many items:
        // await User.updateMany({}, { $pull: { favorites: { $in: user.favorites } } });
        // (Note: The above simpler one will only remove items that were favorited by this user, not those they owned AND other users favorited.
        // The first option is more thorough for cleaning up references to the *deleted user's listings* from other users' favorites.)
        // Let's go with a simpler one that just removes the user, assuming item deletion handles item refs.
        // For production, you'd want to be very careful with orphaned references.

        // A more robust way to clean up favorites:
        // 1. Get all item IDs owned by the user
        const ownedListingIds = (await Item.find({ owner: userId }, '_id')).map(item => item._id);
        // 2. For every other user, pull these item IDs from their favorites array
        await User.updateMany(
            { _id: { $ne: userId } }, // Exclude the user being deleted
            { $pull: { favorites: { $in: ownedListingIds } } }
        );


        // 3. Delete the user account itself
        await User.findByIdAndDelete(userId);

        res.json({ success: true, message: 'Account and associated listings deleted successfully.' });

    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Server error deleting account.' });
    }
};

module.exports = {
    toggleFavorite,
    changePassword, // Export new function
    deleteAccount, // Export new function
};