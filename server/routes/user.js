// server/routes/user.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// Route to toggle an item's favorite status
// Protected by auth middleware, so only logged-in users can use it
router.post('/favorites/toggle', auth, userController.toggleFavorite);

// --- NEW ROUTES ---

// Route to change user password
// Requires authentication
router.put('/change-password', auth, userController.changePassword);

// Route to delete user account
// Requires authentication
router.delete('/delete-account', auth, userController.deleteAccount);


module.exports = router;