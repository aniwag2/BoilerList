const express = require("express");
const router = express.Router();
const { getFilteredListings } = require("../controllers/filteringController");

router.get("/", getFilteredListings); 

module.exports = router;
