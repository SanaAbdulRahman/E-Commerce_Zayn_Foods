const mongoose = require("mongoose");
const { USER, PRODUCT, CART, COUPON, ADDRESS } = require("../utils/constants/schemaName");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: USER,
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: PRODUCT,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: COUPON,
      //default: "63d25c73a171f7d607159252"
    },
    isCouponApplied: {
      type: Boolean,
      default: false,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ADDRESS,
      // default: '63d7ce678ead4ab4a0c40be7'
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(CART, cartSchema);
