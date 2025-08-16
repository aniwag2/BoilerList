const Item = require("../models/Item");

const incrementView = async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.id;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Only increment if viewer is NOT the owner
    if (item.owner.toString() !== userId) {
      item.views = (item.views || 0) + 1;
      await item.save();
    }

    res.json({ success: true, views: item.views });
  } catch (err) {
    console.error("View count error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { incrementView };
