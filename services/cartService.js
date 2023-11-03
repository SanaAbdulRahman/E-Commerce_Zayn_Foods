const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const couponModel = require("../models/couponModel");
const { PRODUCT, COUPON, ADDRESS } = require("../utils/constants/schemaName");

const getCartDetailsForCartPage = async (userId) => {
  try {
    let = {};
    let addresses = [];

    await getCart(userId)
      .then((result) => {
        cartData = result.cartData
      })
      .catch((err) => {
        throw err;
      });

    await getAddress(userId)
      .then((result) => {
        addresses = result;
      })
      .catch((err) => {
        throw err;
      });
    return { cartData, addresses };
  } catch (err) {
    throw err;
  }
};

const getCartDetailsForCheckout = async (userId) => {
  try {
    let cartData = {};

    await getCart(userId)
      .then((result) => {
        cartData = result.cartData;
      })
      .catch((err) => {
        throw err;
      });

    return cartData;
  } catch (err) {
    throw err;
  }
};

const applyCoupon = async (userId, couponCode) => {
  console.log("couponCode :", couponCode);
  return new Promise(async (resolve, reject) => {
    try {
      const coupon = await couponModel.findOne({ couponCode: couponCode });
      console.log("coupon:", coupon);
      if (!coupon) {
        const error = new Error("Cannot find coupon!");
        error.status = 404;
        reject(error)
      }
      if (!coupon.active) {
        const error = new Error("Coupon Not active. Try another coupon!!");
        error.status = 400;
        reject(error)
      }
      await getCart(userId).then(async (response) => {
        if (!response) {
          const error = new Error("Cannot find cart for this user");
          error.status = 400;
          reject(error)
        } else {
          const couponId = coupon._id;
          const cart = response.cart;
          const cartTotal = response.cartData.cartTotal;
          await couponValidationForApplyCoupon({ coupon, cart, cartTotal })
            .then(async (result1) => {
              const result = await cartModel.findOneAndUpdate(
                { user: userId },
                { coupon: couponId, isCouponApplied: true }
              );
              if (!result) {
                const error = new Error("Cannot apply coupon. Try again...");
                error.status = 400;
                reject(error)
              } else {
                resolve(result)
              }
            })
            .catch((err) => {
              const error = new Error(err);
              error.status = 400;
              reject(error)
            })
        }
      });
    } catch (err) {
      err.status = 500;
      reject(err)
    }
  })
};

const removeCoupon = async (userId) => {
  try {
    let cart = await cartModel.findOneAndUpdate({ user: userId }, { isCouponApplied: false });
    return cart;
  } catch (error) {
    throw error;
  }
}

const getCart = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let cart = await cartModel
        .findOne({ user: userId })
        .populate({
          path: "cartItems.product",
          ref: PRODUCT,
        })
        .populate({
          path: "coupon",
          ref: COUPON,
        })
        .populate({
          path: 'addressId',
          ref: ADDRESS
        });
      if (!cart) {
        const error = new Error("Cart not available for this user");
        error.status = 400;
        reject(error);
      }

      calculateActualProductTotal(cart)
        .then(calculateShippingCharge)
        .then(applyingCoupon)
        .then((response) => resolve(response))
        .catch(err => reject(err));


    } catch (err) {
      reject(err);
    }
  });
};

const getAddress = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await userModel.findById(userId).populate("address");
      let addresses = [];
      if (user.address) {
        addresses = user.address;
      } else {
        const error = new Error("Address cannot be found");
        error.status = 400;
        reject(error);
      }

      resolve(addresses);
    } catch (err) {
      reject(err);
    }
  });
};

const calculateActualProductTotal = (cart) => {
  return new Promise(async (resolve, reject) => {
    let cartProductTotal = 0;
    let cartItems = cart?.cartItems.map((dish) => {
      let total = Number(dish.product.productPrice) * Number(dish.quantity);
      let product = {
        id: dish.product._id,
        image: dish.product.productImage1,
        name: dish.product.productName,
        price: dish.product.productPrice,
        quantity: dish.quantity,
        active: dish.product.active,
        totalPrice: total,
      };
      cartProductTotal += total;
      return product;
    })
    resolve({ cart, cartItems, cartProductTotal });
  })
}

const calculateShippingCharge = ({ cart, cartItems, cartProductTotal }) => {
  return new Promise((resolve, reject) => {
    let shippingCharge = 0;
    if (cartProductTotal <= 499 && cartProductTotal > 0) {
      shippingCharge = 60;
    }
    resolve({ cart, cartItems, cartProductTotal, shippingCharge });
  })
}


//New method
const applyingCoupon = ({ cart, cartItems, cartProductTotal, shippingCharge }) => {
  return new Promise(async (resolve, reject) => {
    let couponApplied = false;
    let discountedCartPrice = 0;
    let discountPrice = 0;
    await couponValidationForCartPage({ cart, cartProductTotal })
      .then((result) => {
        couponApplied = result.couponApplied;
        discountedCartPrice = result.discountedCartPrice;
        discountPrice = result.discountPrice;
      })
    const cartData = {
      _id: cart._id,
      address: cart.addressId,
      dishes: cartItems,
      couponApplied: couponApplied,
      coupon: cart?.coupon,
      cartTotal: cartProductTotal,
      shippingCharge: shippingCharge,
      discount: discountPrice,
      grandTotal: (couponApplied ? discountedCartPrice : cartProductTotal) + shippingCharge,
    }
    resolve({
      cartData: cartData,
      cart: cart
    });
  })
}

const couponValidationForApplyCoupon = ({ coupon, cart, cartTotal }) => {
  return new Promise(async (resolve, reject) => {
    let discountPrice = 0;
    let discountedCartPrice = 0;
    const couponThreshold = Number(coupon?.ordersAbove);
    const discount = Number(coupon?.discount);
    const maximumDiscountableAmount = Number(coupon?.maximumDiscountableAmount);
    let currentDate = new Date();
    let couponApplied = false;
    if (!coupon.active) {
      removeCouponFromCart(cart._id)
      return reject("Invalid coupon. Coupon removed");
    } else if (cartTotal < couponThreshold) {
      removeCouponFromCart(cart._id)
      return reject("Cart total is less than coupon minimum required amount. Coupon removed");
    } else if (currentDate > new Date(coupon.expiryDate)) {
      removeCouponFromCart(cart._id)
      return reject("Coupon is expired. Coupon removed")
    } else {
      await couponPerUserCountCheck(cart.user, coupon.couponCode)
        .then((result) => {
          discountPrice = parseInt((cartTotal * Number(discount)) / 100);
          if (discountPrice > maximumDiscountableAmount) {
            discountPrice = maximumDiscountableAmount;
          }
          discountedCartPrice = parseInt(cartTotal - discountPrice);
          couponApplied = true;
        })
        .catch((error) => {
          return reject(error)
        })
    }
    resolve({ couponApplied, discountedCartPrice, discountPrice });
  })
}

const couponValidationForCartPage = ({ cart, cartProductTotal }) => {
  return new Promise(async (resolve, reject) => {
    let discountPrice = 0;
    let discountedCartPrice = 0;
    const couponThreshold = Number(cart?.coupon?.ordersAbove);
    const discount = Number(cart?.coupon?.discount);
    const maximumDiscountableAmount = Number(cart?.coupon?.maximumDiscountableAmount);
    let currentDate = new Date();
    let couponApplied = false;
    if (cart.isCouponApplied) {
      if (!cart.coupon.active) {
        removeCouponFromCart(cart._id)
        return reject("Invalid coupon. Coupon removed");
      } else if (cartProductTotal < couponThreshold) {
        removeCouponFromCart(cart._id)
        return reject("Cart total is less than coupon minimum required amount. Coupon removed");
      } else if (currentDate > new Date(cart.coupon.expiryDate)) {
        removeCouponFromCart(cart._id)
        return reject("Coupon is expired. Coupon removed")
      } else {
        await couponPerUserCountCheck(cart.user, cart.coupon.couponCode)
          .then((result) => {
            discountPrice = parseInt((cartProductTotal * Number(discount)) / 100);
            if (discountPrice > maximumDiscountableAmount) {
              discountPrice = maximumDiscountableAmount;
            }
            discountedCartPrice = parseInt(cartProductTotal - discountPrice);
            couponApplied = true;
          })
          .catch((error) => {
            return reject(error)
          })
      }
    }
    resolve({ couponApplied, discountedCartPrice, discountPrice });
  })
}

const removeCouponFromCart = async (cartId) => {
  try {
    await cartModel.findOneAndUpdate({
      _id: cartId
    },
      {
        isCouponApplied: false
      })
  } catch (error) {
    throw error
  }
}

const couponPerUserCountCheck = async (userId, couponCode) => {
  return new Promise(async (resolve, reject) => {
    try {
      const coupon = await couponModel.findOne({ couponCode: couponCode }).select("users maxUseCount")
      coupon.users.map(_ => {
        if (String(_.userId) === String(userId)) {
          if (_.usedCount >= coupon.maxUseCount) {
            reject("User has reach the maximum usage of this coupon")
          }
        }
      })
      resolve("User is eligible for this coupon")
    } catch (error) {
      console.log(error.message)
      reject(error.message)
    }
  })
}

module.exports = {
  getCartDetailsForCartPage,
  getCartDetailsForCheckout,
  applyCoupon,
  removeCoupon
};


