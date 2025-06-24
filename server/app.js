// import modules
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

// app
const app = express();

// db
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("DB CONNECTED"))
.catch((err) => console.log("DB CONNECTION ERROR", err));

// middleware
app.use(morgan("dev"));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json()); // Essential for parsing JSON request bodies

// routes
const testRoutes = require("./routes/test");
const authRoutes = require("./routes/auth"); // Import your authentication routes

app.use("/", testRoutes);
app.use("/api/auth", authRoutes); // All authentication routes will be prefixed with /api/auth

// port
const port = process.env.PORT || 8000; // Added a fallback port if process.env.PORT is not set

// listener
const server = app.listen(port, () =>
    console.log(`Server is running on port ${port}`)
);