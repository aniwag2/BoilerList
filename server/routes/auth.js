const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // You'll create this

// POST /api/auth/register
router.post('/register', authController.registerUser);

// You might add login and other auth routes here later

module.exports = router;