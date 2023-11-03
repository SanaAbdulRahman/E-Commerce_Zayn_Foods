const { Schema, mongoose } = require("mongoose");

const mailCampaignSchema = new Schema({
    email: {
        type: String,
        required : true
    }
})

module.exports = mongoose.model("mailCampaign", mailCampaignSchema);