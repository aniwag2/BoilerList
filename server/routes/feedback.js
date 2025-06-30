const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

const client = new MongoClient(process.env.MONGO_URI);
let feedbackCollection;

client.connect().then(() => {
	const db = client.db("test"); 
	feedbackCollection = db.collection("feedback");
	console.log("Connected to database and using 'feedback' collection.");
}).catch((err) => {
	console.error("MongoDB connection failed:", err);
});

// POST /api/feedback
router.post("/", async (req, res) => {
	const { email, message } = req.body;

	if (!email || !message) {
		return res.status(400).json({ error: "Email and message are required." });
	}

	try {
		await feedbackCollection.insertOne({
			email,
			message,
			timestamp: new Date(),
		});
		res.status(200).json({ message: "Feedback submitted!" });
	} catch (err) {
		console.error("Failed to insert feedback:", err);
		res.status(500).json({ error: "Could not save feedback." });
	}
});

module.exports = router;
