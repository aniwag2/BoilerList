const express = require('express');
const router = express.Router();
const { searchQuery } = require('../controllers/searchController');

router.post('/', searchQuery);

module.exports = router;