// server/app.js
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
    // useCreateIndex: true, // Deprecated in Mongoose 6+
    // useFindAndModify: false, // Deprecated in Mongoose 6+
})
.then(() => console.log("DB CONNECTED"))
.catch((err) => console.log("DB CONNECTION ERROR", err));

// middleware
app.use(morgan("dev"));
// FIX: Update CORS to allow the custom 'x-auth-token' header
app.use(cors({
    origin: 'https://boilerlist.aniwaghray.com',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'], // Add 'x-auth-token'
}));
app.use(express.json());

// routes
const testRoutes = require("./routes/test");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const listingRoutes = require("./routes/listings");
const feedbackRoutes = require("./routes/feedback");
const reportRoutes = require("./routes/report");
const userRoutes = require("./routes/user");
const filteringRoutes = require("./routes/filtering");
const searchRoutes = require("./routes/search");
const ragRoutes = require("./routes/rag");
const chatRoutes = require("./routes/chat");

app.use("/", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/user", userRoutes);
app.use("/api/filtering", filteringRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/chat", chatRoutes);

// port
const port = process.env.PORT || 8089;

// listener
const server = app.listen(port, () =>
    console.log(`Server is running on port ${port}`)
);