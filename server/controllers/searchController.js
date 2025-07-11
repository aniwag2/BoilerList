const Item = require('../models/Item');


async function searchQuery(req, res) {
    const query = req.body.query;

    try {
        if (query) {
            const items = await Item.aggregate([
                {
                    $search: {
                      index: "default",
                      text: {
                        query: query, 
                        path: "name",
                        fuzzy: {
                          maxEdits: 1,
                        },
                      },
                    },
                  },
                  {
                    $limit: 10,
                  },
                ]);
            res.json({success: true, items: items, query: query});
        } else {
            res.status(400).json({ message: 'No query provided', query: req.body.query });
        }
    } catch (error) {
        console.error('Error searching for items:', error);
        res.status(500).json({ message: 'Server error searching for items.', query: req.body.query });
    }
    
}

module.exports = { searchQuery };
