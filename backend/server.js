require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const ConnectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
//routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/analytics", analyticsRoutes);

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//start our server
const PORT = process.env.PORT || 5000;
ConnectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});