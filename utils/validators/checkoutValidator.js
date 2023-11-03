const Joi = require("joi");

const checkout = Joi.object({
    grandTotal : Joi.number().min(0).required(),
    addressId : Joi.string().not('Select from list').required(),
})

module.exports = checkout;