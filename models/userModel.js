const mongoose = require("mongoose"); // Erase if already required
const { USER, ADDRESS } = require("../utils/constants/schemaName");
const cartModel = require("./cartModel");

// Declare the Schema of the Mongo model
let userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: ADDRESS,
      },
    ],
    password: {
      type: String,
      required: true,
      trim: true,
    },
    wallets: [{
      transactionType: String,
      amount: Number,
      date: {
        type: Date,
        default: Date.now
      }
    }],
    walletBalance: {
      type: Number,
      default: 0, // Set the default wallet balance to 0
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.post('save', async function (user) {
  const userId = user._id;
  const cart = {
    user: userId,
    cartItems: []
  }
  await cartModel.create(cart);
})

//Export the model
module.exports = mongoose.model(USER, userSchema);
