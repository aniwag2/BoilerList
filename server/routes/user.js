// server/routes/user.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // <--- NEW: Import auth middleware
const userController = require('../controllers/userController'); // <--- NEW: Import userController

// Route to toggle an item's favorite status
// Protected by auth middleware, so only logged-in users can use it
router.post('/favorites/toggle', auth, userController.toggleFavorite);

module.exports = router;