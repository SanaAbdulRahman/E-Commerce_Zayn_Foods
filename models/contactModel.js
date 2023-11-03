const mongoose = require('mongoose');
const { PRODUCT, BATCH } = require('../utils/constants/schemaName');

let batchSchema = new mongoose.Schema({
    batchName : {
        type : String,
        required: true,
    },
    startingTime : {
        type : Date,
        required : true
    },
    closingTime : {
        type : Date,
        required : true
    },
    dishes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref: PRODUCT,
    }],
    status: {
        type:Boolean,
        default:true
    },
    description: String,
},{timestamps: true});

module.exports = mongoose.model(BATCH, batchSchema);
