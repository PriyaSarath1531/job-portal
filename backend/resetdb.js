require('dotenv').config();
const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("Error: MONGO_URI is not defined in the .env file.");
  process.exit(1);
  
}

mongoose.connect(mongoURI)
  .then(async () => {
    console.log("Connected to database successfully.");

    await mongoose.connection.dropDatabase();
    console.log("Database cleared (all collections dropped).");

    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err.message);
    process.exit(1);
  });
