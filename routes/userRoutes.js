const express = require("express");
const { getDishFilterBasedOnType } = require("../controller/userCtrl");
const userController = require("../controller/userCtrl");
const session = require("../middlewares/session");
const router = express.Router();

router.get("/", userController.getHome);
//router.get("/", session.verifyUser, userController.getHome);


router.post("/postSignup", userController.postSignup);

router.post("/postSendOtp", userController.postSendOtp);

router.post('/resendOtp', userController.postResendOtp);

router.post("/postSignin", userController.postSignin);

router.get("/getSignout", session.verifyUser, userController.getSignout);

router.post("/postForgotPassword", userController.postForgotPassword);

router.post("/postResetForgotPassword", userController.postResetForgotPassword);

router.get("/dishes", session.verifyUser, userController.getDishes);

router.post("/searchProduct", session.verifyUser, userController.searchProduct);

router.get('/getDishFilterBasedOnType', session.verifyUser, userController.getDishFilterBasedOnType);

router.get("/viewCart", session.verifyUser, userController.getviewcart);

router.get("/dishDetailedView", userController.getDetailedView);

router.post("/postAddReview", session.verifyUser, userController.postAddReview);

router.post("/addToCart", session.verifyUser, userController.addToCart);

router.put("/incrementCartItemQuantity", session.verifyUser, userController.incrementCartItemQuantity);

router.post("/decrementCartItemQuantity", session.verifyUser, userController.decrementCartItemQuantity);

router.get("/deleteProductFromCart", session.verifyUser, userController.deleteProductFromCart);

router.post("/address", session.verifyUser, userController.addAddress);

router.put("/address", session.verifyUser, userController.updateAddress);

router.delete("/address", session.verifyUser, userController.deleteAddress);

router.get("/:addressId/address", session.verifyUser, userController.getAddress);

router.post("/checkout", session.verifyUser, userController.checkout);

router.post("/applyCoupon", session.verifyUser, userController.applyCoupon);

router.delete("/removeCoupon", session.verifyUser, userController.removeCoupon);

router.get("/reviewPayment", session.verifyUser, userController.reviewPayment);

router.post("/confirmOrder", session.verifyUser, userController.confirmOrder);

router.get("/orderConfirmed", session.verifyUser, userController.orderConfirmed);

router.get('/orders', session.verifyUser, userController.getOrders);

router.get('/myprofile', session.verifyUser, userController.getProfile);

router.put('/editUserInfo', session.verifyUser, userController.editUserInfo);

router.post('/resetPassword', session.verifyUser, userController.resetPassword);

router.get('/about', userController.getAbout);

router.get('/contact', userController.getContact);

router.post('/subscribeNewsletter', userController.subscribeNewsletter);

router.post('/sendMessage', userController.sendMessage)
router.post('/cancelOrder', session.verifyUser, userController.cancelOrder);

module.exports = router;
