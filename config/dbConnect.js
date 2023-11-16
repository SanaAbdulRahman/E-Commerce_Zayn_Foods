// const mongoose = require("mongoose");

// module.exports = () => {
//   //const uri = process.env.MONGO_URI;
//   //const uri = "mongodb:/ / 127.0.0.1: 27017 / zAYnFoodsDBNew";
//   const uri = "mongodb://127.0.0.1:27017/zAYnFoodsDBNew";



//   mongoose.set("strictQuery", false);

//   mongoose.connect(uri)
//     .then(() => {
//       console.log("Database connected");
//     })
//     .catch((err) => {
//       console.log(`Database connection failed : ${err}`);
//     });
// };

require('dotenv').config();
//  require('dotenv/config');
const mongoose = require('mongoose');
//  async function connectToMongoDB() {
//     try {
//       await mongoose.connect(process.env.MONGODB_URI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         dbName:'test'
//       });

//       console.log('Connected successfully to MongoDB');
//     } catch (err) {
//       console.error('Failed to connect to MongoDB:', err);
//     }

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