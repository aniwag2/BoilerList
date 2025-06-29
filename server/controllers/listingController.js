const mongoose = require('mongoose');
const Item = require('../models/Item');

async function getListings(req, res) {
    const listings = await Item.find().lean();
    res.json(listings);
}

module.exports = {
    getListings
}