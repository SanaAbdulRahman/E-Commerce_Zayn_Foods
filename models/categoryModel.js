const mongoose = require('mongoose');
const { PRODUCT, CATEGORY } = require('../utils/constants/schemaName');

let categorySchema = new mongoose.Schema({
    categoryName : {
        type : String,
        required: true,
    }, 
    dishes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref: PRODUCT,
    }],
    description: String,
},{timestamps: true});

module.exports = mongoose.model(CATEGORY, categorySchema);
