const Joi = require("joi");

const applyCouponValidator = Joi.object({
    coupon: Joi.string().uppercase().required()
});


module.exports = { applyCouponValidator };