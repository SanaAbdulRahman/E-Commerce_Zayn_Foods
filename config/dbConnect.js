const mongoose = require("mongoose");

module.exports = () => {
  //const uri = process.env.MONGO_URI;
  const uri = "mongodb://127.0.0.1:27017/zAYnFoodsDBNew";


  mongoose.set("strictQuery", false);

  mongoose.connect(uri)
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.log(`Database connection failed : ${err}`);
    });
};