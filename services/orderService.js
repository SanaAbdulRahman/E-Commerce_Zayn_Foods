const configModel = require("../models/configModel");
const orderModel = require("../models/orderModel");
const { COD, ONLINE, WALLET } = require("../utils/constants/paymentMethod");
const { getCartDetailsForCartPage } = require("./cartService");
const { CASHFREE_API_KEY, CASHFREE_SECRET, CASHFREE_RETURN_URL } = require('../utils/constants/cashfreeSecret');
const cartModel = require("../models/cartModel");
const { PAID } = require("../utils/constants/paymentStatus");
const couponModel = require("../models/couponModel");
const { createRazorpayPayment } = require("./paymentService");
const userModel = require("../models/userModel");
const PaymentMethod = require("../utils/constants/paymentMethod");

const generateOrderId = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let orderId = "";
      const findConfig = await configModel.findById("63d85df8de74aab0a523bf32");
      if (!findConfig) {
        const config = await configModel.create({
          _id: "63d85df8de74aab0a523bf32",
          orderCount: 0,
        });
      }
      const config = await configModel.findByIdAndUpdate(
        "63d85df8de74aab0a523bf32",
        {
          $inc: { orderCount: 1 },
        },
        {
          new: true,
        }
      );
      if (isNaN(config.orderCount)) {
        const error = new Error("Cannot generate order ID. Try again later");
        error.status = 400;
        throw error;
      } else {
        orderId = `FH${1000000 + Number(config.orderCount)}`;
      }
      resolve(orderId);
    } catch (err) {
      reject(err);
    }
  });
};

const generateOrder = async (userId, address) => {
  return new Promise(async (resolve, reject) => {
    try {
      await generateOrderId()
        .then(async (orderId) => {
          const { cartData } = await getCartDetailsForCartPage(userId);
          const data = {
            orderId: orderId,
            userId: userId,
            addressId: address,
            orderItems: cartData.dishes.map(item => { return { quantity: item.quantity, product: item.id } }),
            billAmount: cartData.grandTotal,
          };
          console.log(data, 'Order data')
          const order = await orderModel.create(data);
          if (order) {
            resolve(order);
          } else {
            const error = new Error("Order cannot be created");
            error.status = 400;
            reject(error);
          }
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};

// const mapDishesIntoOrderItems = 

//Payment Initialization
const confirmOrder = async (orderId, paymentMethod, req) => {
  console.log("paymentMethod", paymentMethod);
  return new Promise(async (resolve, reject) => {
    try {
      const order = await orderModel.findOneAndUpdate(
        {
          orderId: orderId,
        },
        {
          paymentMethod: paymentMethod,
        }
      );
      //If payment is through COD
      if (paymentMethod === PaymentMethod.COD) {

        //Update payment method in order collection

        if (order) {
          resolve({
            orderId: order.orderId,

            paymentMethod: order.paymentMethod
          });
        } else {
          const error = new Error("Cannot confirm order. Try again later");
          error.status = 500;
          reject(error);
        }
      } else if (paymentMethod === PaymentMethod.ONLINE) {
        if (order) {
          const paymentData = await createRazorpayPayment({ orderId, amount: order.billAmount });
          resolve({ ...paymentData, paymentMethod });
        }
      } else if (paymentMethod === PaymentMethod.WALLET) {
        // Assuming you have a function to get the currently logged in user
        const userId = req.session.userId;
        console.log("userId", userId);

        try {
          const user = await userModel.findById(userId); // Fetch user from the database

          if (!user) {
            const error = new Error("User not found");
            error.status = 404;
            reject(error);
            return;
          }

          // Calculate the order total
          const orderTotal = order.billAmount;
          console.log("confirmOrder->OrderTotal :", orderTotal);

          // Check if the user has sufficient wallet balance
          if (user.walletBalance >= orderTotal) {
            // Deduct the amount from the wallet balance
            user.walletBalance -= orderTotal;
            let walletData = {
              transactionType: 'Debited',
              amount: orderTotal
            }
            user.wallets = [...user.wallets, walletData]
            console.log("Wallets", user.wallets);
            await user.save();

            // Proceed with order confirmation
            if (order) {
              resolve({
                orderId: order.orderId,
                paymentMethod: paymentMethod
              });
            }
          } else {
            const error = new Error("Insufficient wallet balance.");
            error.status = 400;
            reject(error);
          }
        } catch (error) {
          reject(error);
        }
      } else {
        const error = new Error("Invalid payment method");
        error.status = 400;
        reject(error);
      }
    } catch (err) {
      reject(err);
    }
    //   else {
    //     const error = new Error("Please choose payment method");
    //     error.status = 500;
    //     reject(error);
    //   }
    // } catch (err) {
    //   reject(err);
    // }
  });
};

const getOrderFromOrderId = async (orderId) => {
  try {
    const order = await orderModel.findOne({ orderId: orderId }).populate('userId');
    if (!order) {
      const error = new Error("Cannot find order");
      error.status = 404;
      throw error;
    }

    return order;
  } catch (err) {
    throw err;
  }
}

// const createCashfreeOrder = (orderId, paymentMethod) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const order = await getOrderFromOrderId(orderId);

//       const requestOptions = {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-api-version": "2022-09-01",
//           "x-client-id": CASHFREE_API_KEY,
//           "x-client-secret": CASHFREE_SECRET
//         },
//         body: JSON.stringify({
//           "order_id": orderId,
//           "order_amount": parseFloat(order.billAmount).toFixed(2),
//           "order_currency": "INR",
//           "order_meta": {
//             "return_url": `${CASHFREE_RETURN_URL}?order_id={order_id}`
//           },
//           "order_note": `Fudhub Order with ${order.orderId} to customer ${order?.userId?.fullname}`,
//           "customer_details": {
//             "customer_id": order?.userId?._id,
//             "customer_name": order?.userId?.fullname,
//             "customer_email": order?.userId?.email,
//             "customer_phone": order?.userId?.phoneNumber.replace("+91", "").trim()
//           }
//         }),
//       }
//       await fetch("https://sandbox.cashfree.com/pg/orders", requestOptions)
//         .then((response) => {
//           if (response.ok) {
//             response.json().then(async (data) => {
//               const updatedOrder = await updateOrderWithCashfreeData(data, paymentMethod);
//               resolve(updatedOrder);
//             });
//           } else {
//             response.json().then((error) => reject(error))
//           }
//         })
//         .then(data => console.log(data, 'Inside 2nd data'))
//         .catch(err => reject(err));
//     } catch (err) {
//       reject(err);
//     }
//   })
// }

// const updateOrderWithCashfreeData = async ({ order_id, cf_order_id, payment_session_id, order_status }, paymentMethod) => {
//   try {
//     const order = await orderModel.findOneAndUpdate({ orderId: order_id }, {
//       pgCFOrderId: cf_order_id,
//       pgPaymentSessionId: payment_session_id,
//       pgOrderStatus: order_status,
//       paymentMethod: paymentMethod
//     }, { new: true });

//     if (!order) {
//       throw new Error("Cannot update order with cashfree data");
//     }

//     return {
//       orderId: order.orderId,
//       paymentMethod: order.paymentMethod,
//       pgPaymentSessionId: order.pgPaymentSessionId
//     };
//   } catch (err) {
//     throw err;
//   }
// }

const updateConfirmOrder = async (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await getOrderFromOrderId(orderId);
      const userId = order.userId._id;

      if (!order) {
        reject("Cannot find order")
      }

      if (order.paymentMethod === COD) {
        await updateConfirmOrderForCOD(orderId, userId)
          .then((response) => {
            resolve({ success: true, paymentMethod: COD, message: `Successfully placed Order for ${orderId}` });
          })
          .catch(err => {
            console.log(err, 'Error in COD');
            reject({ success: false, paymentMethod: COD, message: err });
          });
      } else if (order.paymentMethod === ONLINE) {
        await updateConfirmOrderForOnline(orderId, userId)
          .then((response) => {
            resolve({ success: true, paymentMethod: ONLINE, message: `Online: Successfully placed Order for ${orderId}` });
          })
          .catch(err => {
            console.log(err, 'Error in Online');
            reject({ success: false, paymentMethod: ONLINE, message: err });
          });
      }
      else if (order.paymentMethod === WALLET) {
        await updateConfirmOrderForWallet(orderId, userId)
          .then((response) => {
            resolve({ success: true, paymentMethod: WALLET, message: `Wallet: Successfully placed Order for ${orderId}` });
          })
          .catch(err => {
            console.log(err, 'Error in Online');
            reject({ success: false, paymentMethod: WALLET, message: err });
          });
      }
    } catch (err) {
      reject(err.message || err);
    }
  })
}

const updateConfirmOrderForCOD = (orderId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newData = {
        isPlaced: true
      };
      await updateOrderInSuccessScenario({ orderId, newData, userId })
        .then(updateCouponIfApplied)
        .then(emptyCart)
        .then((response) => resolve(response))
        .catch((err) => reject(err));
    } catch (err) {
      reject(err)
    }
  })
}

const updateOrderInSuccessScenario = ({ orderId, newData, userId }) => {
  console.log("updateOrderInSuccessScenario -orderId:", orderId);
  return new Promise(async (resolve, reject) => {
    try {
      const order = await orderModel.findOneAndUpdate({ orderId: orderId }, newData, { new: true });
      if (!order) {
        reject(new Error('Cannot update Cart'));
      }

      resolve({ userId });
    } catch (err) {
      reject(err)
    }
  })
}

const updateCouponIfApplied = ({ userId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cart = await cartModel.findOne({ user: userId }).populate("coupon")
      if (!cart) {
        reject(new Error('Cannot update Cart'));
      }
      if (cart.isCouponApplied && cart.coupon) {
        const coupon = await couponModel.findOne({ couponCode: cart.coupon.couponCode })
        let users = []
        if (coupon) {
          let foundUser = false;
          users = coupon.users.map(user => {
            if (String(user.userId) === String(userId)) {
              user.usedCount += 1;
              foundUser = true;
            }
            return user;
          })
          if (!foundUser) {
            users.push({
              userId: userId,
              usedCount: 1
            })
          }
          coupon.users = users;
          await coupon.save();
        }
      } else {
        console.log("coupon not applied for this order")
      }
      resolve({ userId });
    } catch (err) {
      reject(err)
    }
  })
}
const emptyCart = ({ userId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const emptyArray = [];
      const cart = await cartModel.findOneAndUpdate(
        {
          user: userId
        },
        {
          $set: {
            cartItems: emptyArray
          },
          isCouponApplied: false
        },
        {
          new: true
        }
      );

      if (!cart) {
        reject(new Error('Cannot update Cart'));
      }
      resolve('Cart Updated');
    } catch (err) {
      reject(err)
    }
  })
}

const updateConfirmOrderForOnline = (orderId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {

      const newData = {
        isPlaced: true,
        paymentStatus: PAID
      };
      await updateOrderInSuccessScenario({ orderId, newData, userId })
        .then(updateCouponIfApplied)
        .then(emptyCart)
        .then((response) => resolve("Payment Success"))
        .catch((err) => reject(err));

    } catch (err) {
      reject(err)
    }
  })
}
const updateConfirmOrderForWallet = (orderId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newData = {
        isPlaced: true,
        paymentStatus: 'PAID' // Assuming 'PAID' is the status for successful wallet payments
      };

      // Update order in success scenario (similar to updateOrderInSuccessScenario function)
      await updateOrderInSuccessScenario({ orderId, newData, userId })
        .then(updateCouponIfApplied)
        .then(emptyCart)
        .then((response) => resolve("Payment Success")) // You can customize the success message if needed
        .catch((err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}

// const getCashFreeOrderStatus = (orderId, userId) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const requestOptions = {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           "x-api-version": "2022-09-01",
//           "x-client-id": CASHFREE_API_KEY,
//           "x-client-secret": CASHFREE_SECRET
//         }
//       }
//       await fetch(`https://sandbox.cashfree.com/pg/orders/${orderId}`, requestOptions)
//         .then((response) => {
//           if (response.ok) {
//             response.json().then(async (data) => {
//               if (data.order_id === orderId && data.order_status === PAID) {
//                 const newData = { isPlaced: true, paymentStatus: PAID };
//                 resolve({
//                   orderId: orderId,
//                   newData: newData,
//                   userId: userId
//                 });
//               }
//               else {
//                 reject("Payment Failed. Cannot validate payment");
//               }
//             });
//           } else {
//             response.json().then((error) => reject(error))
//           }
//         })
//         .then(data => console.log(data, 'Inside 2nd data'))
//         .catch(err => reject(err));
//     } catch (err) {
//       reject(err)
//     }
//   })
// }

module.exports = {
  generateOrder,
  confirmOrder,
  updateConfirmOrder,
  updateCouponIfApplied
};
