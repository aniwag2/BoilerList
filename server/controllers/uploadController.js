const Item = require('../models/Item');
const User = require('../models/User');


async function uploadItem(req, res) {

    //Get the item details from the request body
    const { name, price, description, category, email } = req.body;
    const image = req.file;

    //Check if all fields are present
    if (!name || !price || !description || !category || !image) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const newItem = new Item({
            name,
            price,
            description,
            category,
            email,
            image: {
                contentType: image.mimetype,
                data: image.buffer,
            } 
        });

        await newItem.save();
        res.status(201).json({ message: 'Item uploaded successfully', item: newItem });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading item', error: error.message });
    }
}


module.exports = { uploadItem };