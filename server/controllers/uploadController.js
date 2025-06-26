const Item = require('../models/Item');


async function uploadItem(req, res) {

    //Get the item details from the request body
    const { name, price, description, category } = req.body;
    const image = req.file;

    //Check if all fields are present
    if (!name || !price || !description || !category || !image) {
        res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const newItem = new Item({
            name,
            price,
            description,
            category,
            image: {
                originalName: image.originalname,
                contentType: image.mimetype,
                path: image.path,
                size: image.size,
                filename: image.filename,
                uploadedAt: new Date()
            } 
        });

        await newItem.save();
        res.status(201).json({ message: 'Item uploaded successfully', item: newItem });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading item', error: error.message });
    }
}


module.exports = { uploadItem };