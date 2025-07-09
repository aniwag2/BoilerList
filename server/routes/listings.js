// server/routes/listings.js
const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const auth = require('../middleware/auth');

// Import Multer components (assuming these are defined in a separate multer config or directly here)
// Make sure these match what you use in server/routes/upload.js if they are global
const multer = require('multer');
const storage = multer.memoryStorage(); // Use memoryStorage for image processing in controller
const uploadImage = multer({ storage: storage }); // Multer instance for image uploads

// Existing routes
router.get('/getListings', auth, listingController.getListings);
router.delete('/deleteListing/:id', auth, listingController.deleteListing);

// --- UPDATED ROUTE for editing/updating a listing to handle image ---
// Add uploadImage.single('image') middleware here to process image updates
router.put('/updateListing/:id', auth, uploadImage.single('image'), listingController.updateListing);

module.exports = router;