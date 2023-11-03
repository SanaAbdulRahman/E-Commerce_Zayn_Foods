require("dotenv").config();
const Razorpay = require('razorpay')
const PaymentDetailModel = require("../models/paymentModel");


let razorPayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})



const createRazorpayPayment = (data) => {
    return new Promise(async (resolve, reject) => {
        const params = {
            amount: data.amount * 100,
            currency: "INR",
            //receipt: req.body.orderId,
            receipt: data.orderId,
            payment_capture: "1"
        }
        console.log("params :", params)
        razorPayInstance.orders.create(params)
            .then(async (response) => {
                console.log("razorpayinstance :", response)

                // Save orderId and other payment details
                const paymentDetail = new PaymentDetailModel({
                    orderId: params.receipt,
                    receiptId: response.id,
                    amount: response.amount,
                    currency: response.currency,
                    status: "Success"
                })
                try {
                    // Render Order Confirmation page if saved succesfully
                    await paymentDetail.save()
                    resolve({
                        key_id: process.env.RAZORPAY_KEY_ID,
                        orderId: params.receipt,
                        receiptId: response.id,
                        paymentDetail
                    });


                } catch (err) {
                    // Throw err if failed to save
                    if (err) throw err;
                }
            }).catch(async (err) => {
                console.log("payment Service catch error :", err);
                const paymentDetail = new PaymentDetailModel({
                    orderId: params.receipt,
                    amount: params.amount,
                    currency: "INR",
                    status: "Failed"
                })
                await paymentDetail.save();
                // Throw err if failed to create order
                reject(err);
            })
    })
}

module.exports = {
    createRazorpayPayment
};

