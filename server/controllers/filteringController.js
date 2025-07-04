const Item = require("../models/Item"); 

const getFilteredListings = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.query;

    const query = {};

    if (minPrice !== undefined && maxPrice !== undefined) {
      query.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
    }

    const items = await Item.find(query);
    res.json({ success: true, listings: items });
  } catch (err) {
    console.error("getFilteredListings error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { getFilteredListings };
