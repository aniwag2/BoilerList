// server/controllers/listingController.js
const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');
const emailSender = require('../utils/emailSender'); // Ensure this import is here

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
                    hasExpressedInterest: (item.interestedBuyers || []).some(
                        buyerEntry => buyerEntry.userId && buyerEntry.userId._id.toString() === userId.toString()
                    )
                }));
                return res.json(listingsWithStatus);
            }
        }

        return res.json(listings.map(item => ({
            ...item,
            isFavorite: false,
            isOwner: false,
            hasExpressedInterest: (item.interestedBuyers || []).some(
                buyerEntry => buyerEntry.userId && buyerEntry.userId._id.toString() === userId?.toString()
            )
        })));

    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ message: 'Server error fetching listings.' });
    }
}

// Helper to get unique notification recipients (interested buyers + favoriting users)
async function getUniqueNotificationRecipients(itemId, listingOwnerId) {
    // 1. Get interested buyers directly from the item
    const item = await Item.findById(itemId)
        .populate('interestedBuyers.userId', 'username email')
        .select('interestedBuyers name') // Select 'name' to pass to email template
        .lean();

    if (!item) return { recipients: new Map(), listingName: '' };

    const recipients = new Map(); // Map to store unique recipients by userId: { userId -> { username, email } }

    item.interestedBuyers.forEach(buyerEntry => {
        if (buyerEntry.userId && buyerEntry.userId._id.toString() !== listingOwnerId.toString()) { // Exclude seller
            recipients.set(buyerEntry.userId._id.toString(), {
                username: buyerEntry.userId.username,
                email: buyerEntry.userId.email
            });
        }
    });

    // 2. Find users who favorited this item (excluding the owner)
    const favoritingUsers = await User.find({
        favorites: itemId,
        _id: { $ne: listingOwnerId } // Exclude the owner of the listing
    }).select('username email').lean();

    favoritingUsers.forEach(user => {
        // Add to map only if not already added by interestedBuyers
        if (!recipients.has(user._id.toString())) {
            recipients.set(user._id.toString(), {
                username: user.username,
                email: user.email
            });
        }
    });

    return { recipients: Array.from(recipients.values()), listingName: item.name };
}


async function deleteListing(req, res) {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: You must be logged in to delete a listing.' });
    }

    try {
        // Fetch listing BEFORE deletion to get details for notifications
        const listing = await Item.findById(id).populate('owner', '_id').lean(); // Get owner ID for recipient exclusion

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found.' });
        }

        if (listing.owner._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this listing.' });
        }

        // --- NEW: Send notifications BEFORE deleting the item ---
        const { recipients, listingName } = await getUniqueNotificationRecipients(listing._id, listing.owner._id);

        await Item.findByIdAndDelete(id); // Now delete the item

        // Clean up from favorites (already doing this)
        await User.updateMany(
            { favorites: id },
            { $pull: { favorites: id } }
        );

        // Send notifications asynchronously (don't await this, let it run in background)
        recipients.forEach(async (recipient) => {
            try {
                await emailSender.sendListingSoldEmail(recipient.email, recipient.username, listingName);
            } catch (emailError) {
                console.error(`Failed to send sold notification email to ${recipient.email}:`, emailError);
            }
        });

        res.json({ message: 'Listing marked as sold and removed successfully.' });

    } catch (error) {
        console.error('Error deleting listing:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid listing ID format.' });
        }
        res.status(500).json({ message: 'Server error deleting listing.' });
    }
}

// --- UPDATED FUNCTION: updateListing to handle image and send notifications ---
async function updateListing(req, res) {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: You must be logged in to edit a listing.' });
    }

    const { name, description, price, category, isBestOffer, isUrgent } = req.body;
    const imageFile = req.file;

    try {
        // Fetch the current listing details before update for notification purposes
        const listing = await Item.findById(id).populate('owner', '_id'); // Need owner ID for getUniqueNotificationRecipients

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found.' });
        }

        if (listing.owner._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this listing.' });
        }

        // Store original listing name for notification if name changes
        const originalListingName = listing.name;

        // Update fields
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

        await listing.save(); // Save the updated listing

        // --- NEW: Send notifications to interested/favorited buyers ---
        const { recipients, listingName } = await getUniqueNotificationRecipients(listing._id, listing.owner._id);

        recipients.forEach(async (recipient) => {
            try {
                await emailSender.sendListingUpdatedEmail(recipient.email, recipient.username, listingName);
            } catch (emailError) {
                console.error(`Failed to send updated notification email to ${recipient.email}:`, emailError);
            }
        });

        res.json({ message: 'Listing updated successfully.', listing });

    } catch (error) {
        console.error('Error updating listing:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid listing ID format.' });
        }
        res.status(500).json({ message: 'Server error updating listing.' });
    }
}

const expressInterest = async (req, res) => {
    const { id: listingId } = req.params;
    const { id: buyerUserId, username: buyerUsername, email: buyerEmail } = req.user;

    if (!buyerUserId || !buyerUsername || !buyerEmail) {
        return res.status(401).json({ message: 'Unauthorized: Buyer information missing from token.' });
    }

    try {
        const listing = await Item.findById(listingId).populate('owner', 'email username');
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found.' });
        }

        if (listing.owner._id.toString() === buyerUserId.toString()) {
            return res.status(403).json({ message: 'You cannot express interest in your own listing.' });
        }

        const alreadyInterested = listing.interestedBuyers.some(
            (buyerEntry) => buyerEntry.userId.toString() === buyerUserId.toString()
        );

        if (alreadyInterested) {
            return res.status(409).json({ message: 'You have already expressed interest in this listing.' });
        }

        listing.interestedBuyers.push({
            userId: buyerUserId,
            username: buyerUsername,
            email: buyerEmail,
            expressedAt: new Date(),
        });

        await listing.save();

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
                interestedBuyersCount: listing.interestedBuyers.length,
                hasExpressedInterest: true
            });
        } else {
            console.error('Failed to send email to seller:', emailResult.error);
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

const sendInterestedBuyersEmail = async (req, res) => {
    const { id: listingId } = req.params;
    const { id: userId } = req.user;

    try {
        const listing = await Item.findById(listingId)
            .populate('owner', 'email username')
            .populate('interestedBuyers.userId', 'username email')
            .lean();

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found.' });
        }

        if (listing.owner._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not own this listing.' });
        }

        const interestedBuyersDetails = listing.interestedBuyers.map(buyerEntry => ({
            username: buyerEntry.userId.username,
            email: buyerEntry.userId.email,
            expressedAt: buyerEntry.expressedAt
        }));

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
    expressInterest,
    sendInterestedBuyersEmail
};