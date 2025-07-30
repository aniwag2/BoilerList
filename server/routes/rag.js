// server/routes/rag.js
const express = require('express');
const router = express.Router();
const { ragQuery, addDocuments } = require('../controllers/RAGController');
const auth = require('../middleware/auth'); // NEW: Import auth middleware

// Apply auth middleware to the main RAG query route
router.post('/', auth, ragQuery); // FIX: Added 'auth' middleware here
router.post('/add', addDocuments); // This route might also need auth if only authorized users can add documents

module.exports = router;