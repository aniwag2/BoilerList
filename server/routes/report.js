const express = require("express");
const router = express.Router();
const Report = require("../models/Report"); // You’ll create this next

router.post("/", async (req, res) => {
  const { listingId, message } = req.body;
  try {
    await Report.create({ listingId, message });
    res.status(200).json({ message: "Report saved." });
  } catch (err) {
    res.status(500).json({ error: "Failed to save report." });
  }
});

module.exports = router;
