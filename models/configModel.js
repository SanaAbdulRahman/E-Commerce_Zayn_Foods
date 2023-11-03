const { Schema, mongoose } = require("mongoose");
const { CONFIG } = require("../utils/constants/schemaName");

const configSchema = new Schema({
    orderCount: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model(CONFIG, configSchema);