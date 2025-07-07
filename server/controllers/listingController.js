// server/controllers/listingController.js
const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');

async function getListings(req, res) {
    const userId = req.user ? req.user.id : null;

    try {
        // When fetching listings, populate the owner to get their ID for comparison on the client-side
        // Select 'owner' to get its _id. You might want to select 'owner.email' too if you display it.
        const listings = await Item.find().populate('owner', '_id email').lean(); // Populate owner's _id and email

        if (userId) {
            const user = await User.findById(userId).select('favorites').lean();
            if (user) {
                const favoritedItemIds = (user.favorites || []).map(favId => favId.toString());

                const listingsWithFavoriteStatus = listings.map(item => ({
                    ...item,
                    isFavorite: favoritedItemIds.includes(item._id.toString()),
                    // Add isOwner flag for conditional rendering on client
                    isOwner: item.owner && item.owner._id ? item.owner._id.toString() === userId.toString() : false
                }));
                return res.json(listingsWithFavoriteStatus);
            }
        }

        return res.json(listings.map(item => ({
            ...item,
            isFavorite: false,
            isOwner: item.owner && item.owner._id ? item.owner._id.toString() === userId?.toString() : false // Handle case where userId might be null
        })));

    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ message: 'Server error fetching listings.' });
    }
}

// --- NEW FUNCTION ---
async function deleteListing(req, res) {
    const { id } = req.params; // Get the listing ID from the URL parameters
    const userId = req.user ? req.user.id : null; // Get the ID of the authenticated user

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: You must be logged in to delete a listing.' });
    }

    try {
        // Find the listing by ID
        const listing = await Item.findById(id);

        // Check if the listing exists
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found.' });
        }

        // Check if the authenticated user is the owner of the listing
        // Ensure both are converted to string for reliable comparison
        if (listing.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this listing.' });
        }

        // If the user is the owner, delete the listing
        await Item.findByIdAndDelete(id);

        // Also remove this item from any user's favorites lists if it was favorited
        await User.updateMany(
            { favorites: id },
            { $pull: { favorites: id } }
        );

        res.json({ message: 'Listing marked as sold and removed successfully.' });

    } catch (error) {
        console.error('Error deleting listing:', error);
        // Handle CastError if ID is not a valid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid listing ID format.' });
        }
        res.status(500).json({ message: 'Server error deleting listing.' });
    }
}

module.exports = {
    getListings,
    deleteListing // Export the new function
};