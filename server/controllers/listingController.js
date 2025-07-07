// server/controllers/listingController.js
const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');

async function getListings(req, res) {
    const userId = req.user ? req.user.id : null;

    try {
        const listings = await Item.find().populate('owner', '_id email').lean();

        if (userId) {
            const user = await User.findById(userId).select('favorites').lean();
            if (user) {
                const favoritedItemIds = (user.favorites || []).map(favId => favId.toString());

                const listingsWithFavoriteStatus = listings.map(item => ({
                    ...item,
                    isFavorite: favoritedItemIds.includes(item._id.toString()),
                    isOwner: item.owner && item.owner._id ? item.owner._id.toString() === userId.toString() : false
                }));
                return res.json(listingsWithFavoriteStatus);
            }
        }

        return res.json(listings.map(item => ({
            ...item,
            isFavorite: false,
            isOwner: item.owner && item.owner._id ? item.owner._id.toString() === userId?.toString() : false
        })));

    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ message: 'Server error fetching listings.' });
    }
}

async function deleteListing(req, res) {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: You must be logged in to delete a listing.' });
    }

    try {
        const listing = await Item.findById(id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found.' });
        }

        if (listing.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this listing.' });
        }

        await Item.findByIdAndDelete(id);

        await User.updateMany(
            { favorites: id },
            { $pull: { favorites: id } }
        );

        res.json({ message: 'Listing marked as sold and removed successfully.' });

    } catch (error) {
        console.error('Error deleting listing:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid listing ID format.' });
        }
        res.status(500).json({ message: 'Server error deleting listing.' });
    }
}

// --- NEW FUNCTION: updateListing ---
async function updateListing(req, res) {
    const { id } = req.params; // Listing ID from URL parameter
    const userId = req.user ? req.user.id : null; // User ID from authenticated request

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: You must be logged in to edit a listing.' });
    }

    // Extract fields that can be updated from the request body
    // We expect these to be sent as 'application/json' if no image update,
    // or as 'multipart/form-data' if an image is also sent.
    const { name, description, price, category } = req.body;
    // For now, let's assume image isn't updated via this endpoint.
    // If it is, `req.file` would be present.

    try {
        const listing = await Item.findById(id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found.' });
        }

        // Verify ownership
        if (listing.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this listing.' });
        }

        // Update the listing fields
        // Only update fields if they are provided in the request body
        if (name !== undefined) listing.name = name;
        if (description !== undefined) listing.description = description;
        if (price !== undefined) listing.price = price;
        if (category !== undefined) listing.category = category;

        // If you allow image updates:
        // if (req.file) {
        //     listing.image = {
        //         contentType: req.file.mimetype,
        //         data: req.file.buffer,
        //     };
        // }

        await listing.save(); // Save the updated listing

        res.json({ message: 'Listing updated successfully.', listing });

    } catch (error) {
        console.error('Error updating listing:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid listing ID format.' });
        }
        res.status(500).json({ message: 'Server error updating listing.' });
    }
}

module.exports = {
    getListings,
    deleteListing,
    updateListing // Export the new function
};