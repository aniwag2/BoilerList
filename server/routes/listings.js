// server/routes/listings.js
const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const auth = require('../middleware/auth');

const multer = require('multer');
const storage = multer.memoryStorage();
const uploadImage = multer({ storage: storage });

// Existing routes
router.get('/getListings', auth, listingController.getListings);
router.delete('/deleteListing/:id', auth, listingController.deleteListing);
router.put('/updateListing/:id', auth, uploadImage.single('image'), listingController.updateListing);

// --- NEW ROUTES FOR BUYER INTEREST ---
// Route for a buyer to express interest in a listing
router.post('/:id/express-interest', auth, listingController.expressInterest);

// Route for a seller to get a list of interested buyers via email
router.get('/:id/send-interested-buyers-email', auth, listingController.sendInterestedBuyersEmail);


module.exports = router;