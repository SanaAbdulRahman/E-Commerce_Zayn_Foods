const mongoose = require('mongoose');
const { USER, PRODUCT, BATCH, CATEGORY } = require('../utils/constants/schemaName');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  productCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: CATEGORY
  },
  productBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: BATCH
  },
  productServings: {
    type: Number,
    required: true
  },
  productType: {
    type: String,
    required: true
  },
  productDescription: {
    type: String,
    required: true
  },
  productImage1: {
    type: String,
  },
  productImage2: {
    type: String,
  },
  productImage3: {
    type: String,
  },
  review: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: USER,
    },
    username: {
      type: String,
    },
    rating: {
      type: Number,
    },
    message: {
      type: String,
    }
  }],
  ratingScore: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model(PRODUCT, productSchema);
