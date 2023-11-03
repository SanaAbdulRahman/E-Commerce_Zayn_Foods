const mongoose = require('mongoose');

let sliderSchema = new mongoose.Schema({
    primaryText : {
        type : String,
        default : '250+ New Dishes'
    },
    altText : {
        type : String,
        default : 'Taste Our New Collection'
    },
    image : {
        type : String,
        required : true,
        default: 'https://res.cloudinary.com/dyt48vxv8/image/upload/v1676180277/Banner%20Images%20%28Don%27t%20Delete%29/slide-01_cvzurr.jpg'
    },
},{timestamps: true});

module.exports = mongoose.model("slider", sliderSchema);
