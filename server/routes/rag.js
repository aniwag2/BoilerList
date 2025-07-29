const express = require('express');
const router = express.Router();
const { ragQuery, addDocuments } = require('../controllers/RAGController');

router.post('/', ragQuery);
router.post('/add', addDocuments);

module.exports = router;