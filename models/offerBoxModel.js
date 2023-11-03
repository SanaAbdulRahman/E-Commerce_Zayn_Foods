const mongoose = require('mongoose');

let offerBoxSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    price : {
        type : String,
    },
    link : {
        type : String,
    },
    image : {
        type : String,
        required : true,
    },
},{timestamps: true});

module.exports = mongoose.model("offerBox", offerBoxSchema);
