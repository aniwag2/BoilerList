// server/routes/upload.js
const express = require('express');
const router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const uploadImage = multer({ storage: storage });
const auth = require('../middleware/auth'); // Correctly imported

const uploadController = require('../controllers/uploadController.js');

// --- CRITICAL CHANGE HERE ---
// The 'auth' middleware MUST run BEFORE uploadController.uploadItem.
// It should also run before multer if you want to protect the upload itself.
// Placing 'auth' right after the path ensures it runs first for this route.
router.post('/uploadItem', auth, uploadImage.single('image'), uploadController.uploadItem);

module.exports = router;