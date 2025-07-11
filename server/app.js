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
// Configure CORS for credentials to be sent
app.use(cors({
    origin: 'http://localhost:3000', // Allow your frontend origin
    credentials: true, // Allow cookies, authorization headers, etc.
}));
app.use(express.json()); // Essential for parsing JSON request bodies

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

app.use("/", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/user", userRoutes); 
app.use("/api/filtering", filteringRoutes);
app.use("/api/search", searchRoutes);

// port
const port = process.env.PORT || 8080;

// listener
const server = app.listen(port, () =>
    console.log(`Server is running on port ${port}`)
);