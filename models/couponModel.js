const mongoose = require("mongoose");
const { COUPON, USER } = require("../utils/constants/schemaName");

const couponSchema = new mongoose.Schema(
  {
    couponName: {
      type: String,
      required: true,
    },
    couponCode: {
      type: String,
      uppercase: true,
      required: true,
      unique: true,
      index: true
    },
    discount: {
      type: Number,
      required: true,
    },
    ordersAbove: {
      type: Number,
      required: true,
    },
    maximumDiscountableAmount: {
      type: Number,
      required: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    maxUseCount: {
      type: Number,
      default: 2
    },
    users: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER
      },
      usedCount: {
        type: Number,
        default: 1
      }
    }],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(COUPON, couponSchema);
