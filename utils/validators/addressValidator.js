const Joi = require("joi");

const addAddress = new Joi.object({
    flatNo: Joi.string().required(),
    street: Joi.string().required(),
    landmark: Joi.string().required(),
    district: Joi.string().required(),
    pincode: Joi.number().min(100000).max(999999).required()
})

const updateAddress = new Joi.object({
    _id: Joi.string().required(),
    flatNo: Joi.string().required(),
    street: Joi.string().required(),
    landmark: Joi.string().required(),
    district: Joi.string().required(),
    pincode: Joi.number().min(100000).max(999999).required()
})

const addAddressWhileCreatingUser = new Joi.object({
    flatNo: Joi.string().optional(),
    street: Joi.string().optional(),
    landmark: Joi.string().optional(),
    district: Joi.string().optional(),
    pincode: Joi.number().min(100000).max(999999).optional()
})

module.exports = {
    addAddress,
    addAddressWhileCreatingUser,
    updateAddress
}