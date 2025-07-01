// server/controllers/listingController.js
const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User'); // <--- NEW: Import User model

async function getListings(req, res) {
    // Check if an authenticated user is making the request
    const userId = req.user ? req.user.id : null; // userId will be available if auth middleware ran

    try {
        const listings = await Item.find().lean(); // .lean() for faster query results

        // If a user is logged in, mark their favorited items
        if (userId) {
            const user = await User.findById(userId).select('favorites').lean(); // Fetch only favorites
            if (user) {
                const favoritedItemIds = (user.favorites || []).map(favId => favId.toString()); // Convert ObjectIds to strings

                const listingsWithFavoriteStatus = listings.map(item => ({
                    ...item,
                    isFavorite: favoritedItemIds.includes(item._id.toString()), // Check if item is in user's favorites
                }));
                return res.json(listingsWithFavoriteStatus);
            }
        }

        // If no user or user not found, return listings without favorite status
        return res.json(listings.map(item => ({ ...item, isFavorite: false })));

    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ message: 'Server error fetching listings.' });
    }
}

module.exports = {
    getListings
}