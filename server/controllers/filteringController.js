const mongoose = require("mongoose");
const Item = require("../models/Item");

const getFilteredListings = async (req, res) => {
  try {
    const { minPrice, maxPrice, category, isBestOffer, isUrgent, ownerId } = req.query;
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

    if (isBestOffer !== undefined) {
      query.isBestOffer = isBestOffer === "true"; 
    }

    if (isUrgent !== undefined) {
      query.isUrgent = isUrgent === "true"; 
    }

    if (ownerId && mongoose.Types.ObjectId.isValid(ownerId)) {
      query.owner = ownerId;
    }

    console.log("Final query being sent to MongoDB:", query); 

    //const items = await Item.find(query).select("-image.data");
    const items = await Item.find(query);
    res.json({ success: true, listings: items });
  } catch (err) {
    console.error("getFilteredListings error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { getFilteredListings };
