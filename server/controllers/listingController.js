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

// --- UPDATED FUNCTION: updateListing to handle image ---
async function updateListing(req, res) {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: You must be logged in to edit a listing.' });
    }

    // When Multer is used, text fields come from req.body and file from req.file
    const { name, description, price, category } = req.body;
    const imageFile = req.file; // This will contain the new image data if provided

    try {
        const listing = await Item.findById(id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found.' });
        }

        if (listing.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this listing.' });
        }

        // Update fields only if they are provided in the request body
        // Note: For 'multipart/form-data', even if a field is not changed, it might still be in req.body
        // Check for undefined or null if you want stricter control over what gets updated
        if (name !== undefined) listing.name = name;
        if (description !== undefined) listing.description = description;
        // Convert price to a number as it comes as string from form data
        if (price !== undefined) listing.price = parseFloat(price);
        if (category !== undefined) listing.category = category;

        // --- NEW LOGIC: Handle image update ---
        if (imageFile) {
            listing.image = {
                contentType: imageFile.mimetype,
                data: imageFile.buffer, // Multer's memoryStorage provides buffer
            };
        }
        // If imageFile is null/undefined, the existing image data on the listing is retained.

        await listing.save();

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
    updateListing
};