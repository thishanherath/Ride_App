const mongoose = require("mongoose");

const MONGO_DB = {
  production: { url: process.env.MONGODB_PROD_URL, type: "Atlas" },
  development: { url: process.env.MONGODB_DEV_URL, type: "Compass" },
};

// default to development when ENVIRONMENT is not set or invalid
const environment = process.env.ENVIRONMENT && MONGO_DB[process.env.ENVIRONMENT] ? process.env.ENVIRONMENT : 'development';

const mongoUrl = MONGO_DB[environment].url;

if (!mongoUrl) {
  console.error(`MongoDB connection string for environment '${environment}' is not set. Check your .env file.`);
} else {
  mongoose
    .connect(mongoUrl)
    .then(() => {
      console.log("Connected to MongoDB (", MONGO_DB[environment].type, ") ->", mongoUrl);
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB:", err && err.message ? err.message : err);
    });
}

module.exports = mongoose.connection;
