const mongoose = require("mongoose");
const { ADDRESS, USER } = require("../utils/constants/schemaName");
const userModel = require("./userModel");

// Declare the Schema of the Mongo model
let addressSchema = new mongoose.Schema(
  {
    flatNo: String,
    street: String,
    landmark: String,
    pincode: Number,
    district: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: USER,
    },
  },
  { timestamps: true }
);

addressSchema.post("save", async function (address) {
  const userId = address.userId;
  const addressId = [address._id];
  await userModel.findByIdAndUpdate(
    {_id: userId },
    {
      $addToSet: { address: addressId },
    }
  );
});
//Export the model
module.exports = mongoose.model(ADDRESS, addressSchema);
