// server/routes/listings.js
const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const auth = require('../middleware/auth');

// Apply auth middleware. `auth` doesn't explicitly deny if no token, just sets req.user=null
// if token is missing/invalid. This is ideal for getListings.
router.get('/getListings', auth, listingController.getListings);

// --- NEW ROUTE ---
// Route to delete (mark as sold) a listing by its ID
// This route requires authentication and will use a new controller function
router.delete('/deleteListing/:id', auth, listingController.deleteListing);

router.put('/updateListing/:id', auth, listingController.updateListing);

module.exports = router;