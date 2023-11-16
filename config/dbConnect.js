
require('dotenv').config();
//  require('dotenv/config');
const mongoose = require('mongoose');


async function connectToMongoDB() {
  try {
    // Add a delay before connecting (e.g., 5 seconds)
    await new Promise(resolve => setTimeout(resolve, 5000));

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected successfully to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
}
module.exports = connectToMongoDB;