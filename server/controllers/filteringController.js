const Item = require("../models/Item");

const getFilteredListings = async (req, res) => {
  try {
    const { minPrice, maxPrice, category, isBestOffer, isUrgent } = req.query;
    const query = {};

    if (minPrice !== undefined && maxPrice !== undefined) {
      query.price = {
        $gte: parseInt(minPrice),
        $lte: parseInt(maxPrice),
      };
    }

    if (category && category !== "") {
      query.category = category;
    }

    if (isBestOffer) {
      query.isBestOffer = isBestOffer;
    }

    if (isUrgent) {
      query.isUrgent = isUrgent;
    }

    // Exclude image data to improve performance
    const items = await Item.find(query).select("-image.data");

    res.json({ success: true, listings: items });
  } catch (err) {
    console.error("getFilteredListings error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};




module.exports = { getFilteredListings};
