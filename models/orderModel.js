const mongoose = require("mongoose");
const { NOT_PAID } = require("../utils/constants/paymentStatus");
const { ORDER, PRODUCT, ADDRESS, USER } = require("../utils/constants/schemaName");
const PaymentMethod = require("../utils/constants/paymentMethod");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: USER,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ADDRESS,
    },
    orderItems: [
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
    billAmount: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "on-the-way", "cancelled", "cancelRequest", "delivered"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      //uppercase: true,
      required: true,
      default: PaymentMethod.COD,
      //enum: ["COD", "Online", "Wallet"],
      enum: Object.values(PaymentMethod)
    },
    paymentStatus: {
      type: String,
      default: NOT_PAID,
    },
    isPlaced: {
      type: Boolean,
      default: false
    },
    pgOrderStatus: String,
    pgCFOrderId: String,
    pgPaymentSessionId: String
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(ORDER, orderSchema);
