// server/routes/listings.js
const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const auth = require('../middleware/auth'); // <--- NEW: Import auth middleware

// Apply auth middleware. `auth` doesn't explicitly deny if no token, just sets req.user=null
// if token is missing/invalid. This is ideal for getListings.
router.get('/getListings', auth, listingController.getListings); // <--- Apply auth middleware

module.exports = router;