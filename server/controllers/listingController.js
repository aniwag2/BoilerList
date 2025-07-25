// server/controllers/listingController.js
const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');
const emailSender = require('../utils/emailSender'); // NEW: Import email sender

async function getListings(req, res) {
    const userId = req.user ? req.user.id : null;

    try {
        const listings = await Item.find()
            .populate('owner', '_id email username')
            .populate('interestedBuyers.userId', '_id username email')
            .lean();

        if (userId) {
            const user = await User.findById(userId).select('favorites').lean();
            if (user) {
                const favoritedItemIds = (user.favorites || []).map(favId => favId.toString());

                const listingsWithStatus = listings.map(item => ({
                    ...item,
                    isFavorite: favoritedItemIds.includes(item._id.toString()),
                    isOwner: item.owner && item.owner._id ? item.owner._id.toString() === userId.toString() : false,
                    // FIX: Add || [] to handle cases where interestedBuyers might be undefined for old listings
                    hasExpressedInterest: (item.interestedBuyers || []).some( // <--- FIX IS HERE
                        buyerEntry => buyerEntry.userId && buyerEntry.userId._id.toString() === userId.toString()
                    )
                }));
                return res.json(listingsWithStatus);
            }
        }

        // If no user is logged in, return listings without personalized statuses
        return res.json(listings.map(item => ({
            ...item,
            isFavorite: false,
            isOwner: false,
            // FIX: Add || [] here as well
            hasExpressedInterest: (item.interestedBuyers || []).some( // <--- FIX IS HERE
                buyerEntry => buyerEntry.userId && buyerEntry.userId._id.toString() === userId?.toString() // Use optional chaining for userId on the right too
            )
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

        // Remove this item from any user's favorites lists if it was favorited
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

async function updateListing(req, res) {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: You must be logged in to edit a listing.' });
    }

    const { name, description, price, category, isBestOffer, isUrgent } = req.body;
    const imageFile = req.file;

    try {
        const listing = await Item.findById(id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found.' });
        }

        if (listing.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this listing.' });
        }

        if (name !== undefined) listing.name = name;
        if (description !== undefined) listing.description = description;
        if (price !== undefined) listing.price = parseFloat(price);
        if (category !== undefined) listing.category = category;
        if (isBestOffer !== undefined) listing.isBestOffer = isBestOffer;
        if (isUrgent !== undefined) listing.isUrgent = isUrgent;

        if (imageFile) {
            listing.image = {
                contentType: imageFile.mimetype,
                data: imageFile.buffer,
            };
        }

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

// --- NEW FUNCTION: Express Interest in a Listing ---
const expressInterest = async (req, res) => {
    const { id: listingId } = req.params;
    // Buyer's info comes from the authenticated token via req.user
    const { id: buyerUserId, username: buyerUsername, email: buyerEmail } = req.user;

    if (!buyerUserId || !buyerUsername || !buyerEmail) {
        // This check should ideally be redundant if auth middleware works correctly
        return res.status(401).json({ message: 'Unauthorized: Buyer information missing from token.' });
    }

    try {
        // Find the listing and populate its owner's details for email notification
        const listing = await Item.findById(listingId).populate('owner', 'email username');
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found.' });
        }

        // Prevent owner from expressing interest in their own item
        if (listing.owner._id.toString() === buyerUserId.toString()) {
            return res.status(403).json({ message: 'You cannot express interest in your own listing.' });
        }

        // Check if buyer has already expressed interest to prevent duplicates
        const alreadyInterested = listing.interestedBuyers.some(
            (buyerEntry) => buyerEntry.userId.toString() === buyerUserId.toString()
        );

        if (alreadyInterested) {
            return res.status(409).json({ message: 'You have already expressed interest in this listing.' });
        }

        // Add buyer's details to the interestedBuyers array
        listing.interestedBuyers.push({
            userId: buyerUserId,
            username: buyerUsername,
            email: buyerEmail,
            expressedAt: new Date(),
        });

        await listing.save();

        // Send email to the seller
        const emailResult = await emailSender.sendBuyerInterestEmail(
            listing.owner.email,
            listing.owner.username,
            buyerUsername,
            buyerEmail,
            listing.name
        );

        if (emailResult.success) {
            res.status(200).json({
                success: true,
                message: 'Interest expressed successfully and seller notified!',
                interestedBuyersCount: listing.interestedBuyers.length, // Send back new count
                hasExpressedInterest: true // Confirm status for client-side button disable
            });
        } else {
            console.error('Failed to send email to seller:', emailResult.error);
            // Even if email fails, interest is recorded in DB. Notify user about email issue.
            res.status(200).json({
                success: true,
                message: 'Interest expressed, but there was an issue notifying the seller by email.',
                interestedBuyersCount: listing.interestedBuyers.length,
                hasExpressedInterest: true
            });
        }

    } catch (error) {
        console.error('Error expressing interest:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid listing ID format.' });
        }
        res.status(500).json({ message: 'Server error expressing interest.' });
    }
};

// --- NEW FUNCTION: Send Interested Buyers List Email ---
const sendInterestedBuyersEmail = async (req, res) => {
    const { id: listingId } = req.params;
    const { id: userId } = req.user; // Seller's user ID from authenticated token

    try {
        // Find the listing and populate owner and interested buyers details
        // We use .populate('interestedBuyers.userId', 'username email') to get full user data
        // for each interested buyer, as only their userId is stored by default in interestedBuyers array.
        const listing = await Item.findById(listingId)
            .populate('owner', 'email username')
            .populate('interestedBuyers.userId', 'username email') // Populate the actual User document fields
            .lean(); // Use .lean() as we are not modifying and want faster reads

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found.' });
        }

        // Verify that the requesting user is the owner of the listing
        if (listing.owner._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not own this listing.' });
        }

        // Map interestedBuyers to the format expected by the email sender (which is already done by populate)
        const interestedBuyersDetails = listing.interestedBuyers.map(buyerEntry => ({
            username: buyerEntry.userId.username, // Access populated user data
            email: buyerEntry.userId.email,       // Access populated user data
            expressedAt: buyerEntry.expressedAt
        }));

        // Send email to the seller with the list of interested buyers
        const emailResult = await emailSender.sendInterestedBuyersListEmail(
            listing.owner.email,
            listing.owner.username,
            listing.name,
            interestedBuyersDetails
        );

        if (emailResult.success) {
            res.status(200).json({ success: true, message: 'Email with interested buyers list sent successfully!' });
        } else {
            console.error('Failed to send interested buyers list email:', emailResult.error);
            res.status(500).json({ success: false, message: 'Failed to send interested buyers list email due to server error.' });
        }

    } catch (error) {
        console.error('Error sending interested buyers email:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid listing ID format.' });
        }
        res.status(500).json({ message: 'Server error sending interested buyers email.' });
    }
};


module.exports = {
    getListings,
    deleteListing,
    updateListing,
    expressInterest, // NEW: Export new function
    sendInterestedBuyersEmail // NEW: Export new function
};