const Joi = require("joi");

const postSignupValidator = (req) => {
  const username = req.username.trim();
  const password = req.password;
  const email = req.email.trim();
  const phoneNumber = req.phoneNumber;
  const fullname = req.fullname;
  const flatNo = req.flatNo;
  const street = req.street;
  const landmark = req.landmark;
  const district = req.district;
  const pincode = req.pincode;

  let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  let usernameRegex = /^[a-zA-Z0-9]+$/;
  let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;

  if (!username && username !== undefined && typeof username !== "string" && !username.match(usernameRegex)) {
    throw new Error("Username is not valid");
  }
  if (!password && password !== undefined && typeof password !== "string" && !password.match(passwordRegex)) {
    throw new Error("Password is not valid");
  }
  if (!email && email !== undefined && typeof email !== "string" && !email.match(mailformat)) {
    throw new Error("Email is not valid");
  }
  if (
    !phoneNumber &&
    phoneNumber !== undefined
  ) {
    console.log(phoneNumber)
    throw new Error("Phone Number is not valid");
  }
  if (!fullname && fullname !== undefined && typeof fullname !== "string") {
    throw new Error("Fullname is not valid");
  }
  if (!flatNo && flatNo !== undefined && typeof flatNo !== "string") {
    throw new Error("Flat Number is not valid");
  }
  if (!street && street !== undefined && typeof street !== "string") {
    throw new Error("street is not valid");
  }
  if (!landmark && landmark !== undefined && typeof landmark !== "string") {
    throw new Error("landmark is not valid");
  }
  if (!district && district !== undefined && typeof district !== "string") {
    throw new Error("district is not valid");
  }
  if (!pincode && pincode !== undefined && typeof pincode !== "number") {
    throw new Error("pincode is not valid");
  }
};

const signUpSendOTP = new Joi.object({
  username: Joi.string().min(3).max(20).required().trim(),
  password: Joi.string().min(6).max(16).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  fullname: Joi.string().min(3).max(20).required().trim(),
  flatNo: Joi.string().min(3).max(20).required().trim(),
  street: Joi.string().min(3).max(20).required().trim(),
  landmark: Joi.string().min(3).max(20).required().trim(),
  district: Joi.string().min(3).max(20).required().trim(),
  pincode: Joi.number().min(100000).max(999999).required()
})

module.exports = {
  signUpSendOTP,
  postSignupValidator
}

