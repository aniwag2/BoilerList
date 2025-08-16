const express = require("express");
const router = express.Router();
const { incrementView } = require("../controllers/view");
const auth = require("../middleware/auth");

router.post("/:id", auth, incrementView);

module.exports = router;
