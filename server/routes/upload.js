const express = require('express');
const router = express.Router();

// This keeps the image in the server in the uploadImages folder to maintain persistence
const multer = require('multer');
const storage = multer.memoryStorage();
const uploadImage = multer({ storage: storage });

const uploadController = require('../controllers/uploadController.js');

//Upload an item to the server. The image is stored in the uploadImages folder using multer.single('image')
router.post('/uploadItem', uploadImage.single('image'), uploadController.uploadItem);

module.exports = router;