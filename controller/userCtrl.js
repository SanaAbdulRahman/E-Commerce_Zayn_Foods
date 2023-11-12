const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const addressModel = require("../models/addressModel");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const batchModel = require("../models/batchModel");
const sliderModel = require("../models/sliderModel");
const generateOTP = require("../utils/generateOtp");
const generatePassword = require("../utils/generatePassword");
const sendMail = require("../utils/validators/nodeMailer");
const { format } = require("date-fns");
const { CATEGORY, PRODUCT } = require("../utils/constants/schemaName");
const cartModel = require("../models/cartModel");
const moment = require("moment");
const { addAddress, updateAddress } = require("../utils/validators/addressValidator");
const {
  getCartDetailsForCartPage,
  getCartDetailsForCheckout,
  applyCoupon,
  removeCoupon,
} = require("../services/cartService");
const checkout = require("../utils/validators/checkoutValidator");
const orderValidator = require("../utils/validators/orderValidator");
const { applyCouponValidator } = require("../utils/validators/couponValidator");
const { generateOrder, confirmOrder, getOrderFromOrderId, createCashfreeOrder, updateConfirmOrder } = require("../services/orderService");
const { find, findOne } = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const { postSignupValidator } = require("../utils/validators/postSignup.validator");
const offerBoxModel = require("../models/offerBoxModel");
const mailCampaignModel = require("../models/mailCampaignModel");
const sendMessageToAdmin = require("../utils/validators/adminMsgSender");
const PaymentMethod = require("../utils/constants/paymentMethod");

const securePassword = async (password) => {
  try {
    const passwordhash = await bcrypt.hash(password, 10);
    return passwordhash;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

const secureOtp = async (otp) => {
  try {
    const otphash = await bcrypt.hash(otp, 10);
    return otphash;
  } catch (error) {
    console.error(error);
  }
};


module.exports = {

  getIndex: async (req, res, next) => {
    try {
      const slider = await sliderModel.find();
      const offerBox = await offerBoxModel.find();
      const dishes = await getDishesForDishesList();
      const categories = await getCategoriesForDishesList();
      res.render("user/index", { dishes, slider, offerBox, categories });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  getHome: async (req, res, next) => {

    try {

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;
      const skip = (page - 1) * limit;
      // const startIndex = (page - 1) * limit;
      console.log("skip", skip);
      console.log("limit", limit);

      const userId = req.session.userId;

      const currentTime = format(new Date(), "HH:mm:ss");
      console.log("currentTime", currentTime);


      // var compareDate = moment("15/02/2013", "DD/MM/YYYY");
      // var startDate = moment("12/01/2013", "DD/MM/YYYY");
      // var endDate = moment("15/01/2013", "DD/MM/YYYY");

      // // omitting the optional third parameter, 'units'
      // compareDate.isBetween(startDate, endDate); //false in this case

      const batch = await batchModel.find()
      const currentBatch = batch.find(_batch => {

        const _format = 'hh:mm:ss A';

        // var time = moment() gives you current time. no format required.
        const time = moment(moment().format('hh:mm:ss A'), _format);
        const beforeTime = moment(moment(_batch.startingTime).format('hh:mm:ss A'), _format);
        const afterTime = moment(moment(_batch.closingTime).format('hh:mm:ss A'), _format);
        console.log("isBetween", time.isBetween(beforeTime, afterTime));
        return time.isBetween(beforeTime, afterTime)

      })
      console.log("batchNew", currentBatch);
      const _filterParams = {}
      if (currentBatch) {
        _filterParams.productBatch = currentBatch._id;
      }
      let products = await productModel
        .find({ ..._filterParams })
        .populate("productCategory")
        .populate("productBatch")
        .skip(skip) // Apply skip based on current page
        .limit(limit) // Apply limit for the number of products per page
        .exec();

      // let productsSkip = await productModel
      //   .find({ active: true }).skip(skip).limit(limit);
      console.log("products", products);

      // let batches = await batchModel.aggregate([



      //   // {
      //   //   $match: {
      //   //     status: true,
      //   //   },
      //   // },
      //   {
      //     $addFields: {
      //       startTime: {
      //         $substr: [
      //           {
      //             $dateToString: {
      //               format: "%H:%M:%S",
      //               date: "$startingTime",
      //               timezone: "Asia/Kolkata",
      //             },
      //           },
      //           0,
      //           8,
      //         ],
      //       },
      //     },
      //   },
      //   {
      //     $addFields: {
      //       endTime: {
      //         $substr: [
      //           {
      //             $dateToString: {
      //               format: "%H:%M:%S",
      //               date: "$closingTime",
      //               timezone: "Asia/Kolkata",
      //             },
      //           },
      //           0,
      //           8,
      //         ],
      //       },
      //     },
      //   },
      //   // {
      //   //   $match: {
      //   //     $or: [
      //   //       {
      //   //         batchName: "All Time",
      //   //       },
      //   //       {
      //   //         $and: [
      //   //           { startTime: { $lte: currentTime } },
      //   //           { endTime: { $gte: currentTime } },
      //   //         ],
      //   //       },
      //   //     ],
      //   //   },
      //   // },
      //   {
      //     $project: {
      //       _id: 0,
      //       dishes: 1,
      //     },
      //   },
      //   {
      //     $sort: { "dishes.updatedAt": -1 } // Sort dishes in descending order of updatedAt
      //   },
      //   {
      //     $skip: skip // Skip the specified number of dishes based on current page
      //   },
      //   {
      //     $limit: limit // Limit the number of products per page
      //   }

      // ])

      // console.log("batches :", batches);
      //User.countDocuments({ age: { $gte: 5 } }
      const count = await productModel.countDocuments({ ..._filterParams })
      console.log("count :", count);
      // let dishes = await batchModel.populate(batches, {
      //   path: "dishes",
      //   match: { active: true }, // Filter dishes with active: true
      //   populate: [
      //     {
      //       path: "productCategory",
      //       ref: CATEGORY,
      //       select: "categoryName -_id",
      //     },
      //   ],

      // })

      // let dishes = await batchModel.populate({
      //   path: "dishes",
      //   match: { active: true },
      //   // sort: {
      //   //   updatedAt: -1
      //   // }, Filter dishes with active: true
      //   populate: [
      //     {
      //       path: "productCategory",
      //       ref: CATEGORY,
      //       select: "categoryName -_id",
      //     },
      //   ],
      //   // options: {
      //   //   skip: skip, Skip the specified number of dishes based on current page
      //   //   limit: limit  Limit the number of products per page
      //   // },

      // });

      //  console.log("dishes length", dishes, dishes.length);
      let categories = await categoryModel.aggregate([
        {
          $addFields: {
            productSize: {
              $cond: {
                if: { $isArray: "$dishes" },
                then: { $size: "$dishes" },
                else: 0,
              },
            },
          },
        },
        {
          $sort: {
            productSize: -1,
          },
        },
        {
          $project: {
            categoryName: 1,
          },
        },
      ])
      console.log("categories", categories);
      //const currentPage = page;
      const slider = await sliderModel.find();
      const offerBox = await offerBoxModel.find();
      let cartStatus = await cartModel.find({ user: userId });
      let cartDishCount = cartStatus[0]?.cartItems.length || 0;

      //console.log("categories and dish :", categories, dishes)
      if (userId) {
        res.render("user/home", {
          products, current: page, limit, pages: Math.ceil(count / limit), categories, cartDishCount, slider, offerBox
        });
      } else {
        const body = { generatedOTP: null };
        res.render("user/index", { products, current: page, limit, pages: Math.ceil(count / limit), body, slider, offerBox, categories });

      }

    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).send('Internal Server Error'); // Send a 500 response to the client
    }

  },

  postSignup: async (req, res, next) => {
    try {
      // await postSignupValidator(req.body);
      const otpMatch = await bcrypt.compare(
        req.body.otpInputField,
        req.body.generatedOTP
      );
      if (otpMatch) {
        const hashedPassword = await securePassword(req.body.password);
        const findUser = await userModel
          .findOne({ email: req.body.email, username: req.body.username })
          .populate("address");

        if (findUser) {
          console.error("User Already Exist");
          const error = new Error("User Already Exist");
          error.status = 400;
          error.isRestCall = true;
          next(error);
        } else {
          const address = new addressModel();
          address.flatNo = req.body.flatNo;
          address.street = req.body.street;
          address.landmark = req.body.landmark;
          address.pincode = Number(req.body.pincode);
          address.district = req.body.district;
          address.userId = new mongoose.Types.ObjectId();
          const newAddress = await address.save();
          if (!newAddress) {
            console.error("Address can not be added");
            const error = new Error("Address can not be added");
            error.status = 400;
            error.isRestCall = true;
            next(error);
          }
          const user = new userModel();
          (user._id = address.userId),
            (user.username = req.body.username),
            (user.fullname = req.body.fullname),
            (user.phoneNumber = req.body.phoneNumber),
            (user.email = req.body.email),
            (user.password = hashedPassword),
            (user.address = [...user.address, address._id]);
          const newUser = await user.save();
          if (!newUser) {
            console.error("User can not be added");
            const error = new Error("User can not be added");
            error.status = 400;
            error.isRestCall = true;
            next(error);
          }
          req.session.user = true;
          req.session.userId = user._id;
          res.status(200).send({ status: 200, user })
        }
      } else {
        res.send({ status: 400 })
      }
    } catch (err) {
      console.error(err);
      err.status = 500;
      err.isRestCall = true;
      next(err);
    }
  },

  postSendOtp: async (req, res, next) => {
    try {
      // let body = await postSignupValidator.signUpSendOTP.validateAsync(req.body);
      let body = req.body;
      console.log(body, "body", body.username, " body.useraname")
      const findUser = await userModel
        .findOne({
          $or: [
            { email: body.email },
            { username: body.username },
            { phoneNumber: body.phoneNumber }
          ]
        })
      console.log(findUser, "finduser")
      if (findUser) {
        res.status(401).send({ status: 401, errorMsg: "User Already Exist" })
      } else {
        // let generatedOTP = "1234";
        let generatedOTP = generateOTP();
        sendMail(generatedOTP, body.email);
        console.log("Otp is : ", generatedOTP)
        generatedOTP = await secureOtp(generatedOTP);
        body = { ...body, generatedOTP: generatedOTP };
        res.status(200).send({ status: 200, data: body })
      }
    } catch (err) {
      console.error(err);
      next(err)
    }
  },

  postResendOtp: async (req, res, next) => {

  },

  postSignin: async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const userData = await userModel.findOne({ username: username });
    try {
      if (userData) {
        if (userData.isBlocked == false) {
          const passwordMatch = await bcrypt.compare(
            password,
            userData.password
          );
          if (passwordMatch) {
            req.session.user = true;
            req.session.userId = userData._id;
            res.status(200).send({ data: "Login success" });
          } else {
            const error = new Error("Password does not match");
            error.status = 400;
            error.isRestCall = true;
            next(error);
          }
        } else {
          console.error("User is blocked");
          const error = new Error("User is blocked");
          error.status = 400;
          error.isRestCall = true;
          next(error);
        }
      } else {
        console.error("No user data available");
        const error = new Error("No user data available");
        error.status = 400;
        error.isRestCall = true;
        next(error);
      }
    } catch (error) {
      console.error(error);
      error.status = 500;
      error.isRestCall = true;
      next(error);
    }
  },

  getSignout: (req, res, next) => {
    delete req.session.user;
    delete req.session.userId;
    console.log("get signout :", req.session)
    res.redirect("/");
  },

  postForgotPassword: async (req, res, next) => {
    let body = req.body;
    const userData = await userModel.findOne({ email: body.email });
    if (userData) {
      // let generatedOTP = "1234";
      let generatedOTP = generateOTP();
      sendMail(generatedOTP, body.email);
      forgotPasswordOTP = await secureOtp(generatedOTP);
      body = { forgotPasswordOTP: forgotPasswordOTP, userMail: body.email };
      res.status(200).send({ status: 200, body: body })
    } else {
      const error = new Error("No user data available");
      error.status = 400;
      error.isRestCall = true;
      next(error);
    }
  },

  postResetForgotPassword: async (req, res, next) => {
    let body = req.body
    console.log(body)
    const otpMatch = await bcrypt.compare(
      body.otpFromUser,
      body.otpFromBackend
    );
    if (otpMatch) {
      const hashedPassword = await securePassword(body.newPassword);
      const user = await userModel.findOneAndUpdate({ email: body.email }, {
        $set: {
          password: hashedPassword
        }
      })
      req.session.user = true;
      req.session.userId = user._id;
      res.status(200).send({ status: 200 })
    } else {
      const error = new Error("OTP does not match");
      error.status = 400;
      error.isRestCall = true;
      next(error);
    }
  },

  getDishes: async (req, res, next) => {
    const currentTime = format(new Date(), "HH:mm:ss");
    let batches = await batchModel.aggregate([
      {
        $match: {
          status: true,
        },
      },
      {
        $addFields: {
          startTime: {
            $substr: [
              {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: "$startingTime",
                  timezone: "Asia/Kolkata",
                },
              },
              0,
              8,
            ],
          },
        },
      },
      {
        $addFields: {
          endTime: {
            $substr: [
              {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: "$closingTime",
                  timezone: "Asia/Kolkata",
                },
              },
              0,
              8,
            ],
          },
        },
      },
      // {
      //   $match: {
      //     $or: [
      //       {
      //         batchName: "All Time",
      //       },
      //       {
      //         $and: [
      //           { startTime: { $lte: currentTime } },
      //           { endTime: { $gte: currentTime } },
      //         ],
      //       },
      //     ],
      //   },
      // },
      {
        $project: {
          _id: 0,
          dishes: 1,
        },
      },
    ]);
    let dishes = await batchModel.populate(batches, {
      path: "dishes",
      populate: [
        {
          path: "productCategory",
          ref: CATEGORY,
          select: "categoryName -_id",
        },
      ],
    });
    let categories = await categoryModel.aggregate([
      {
        $addFields: {
          productSize: {
            $cond: {
              if: { $isArray: "$dishes" },
              then: { $size: "$dishes" },
              else: 0,
            },
          },
        },
      },
      {
        $sort: {
          productSize: -1,
        },
      },
      {
        $project: {
          categoryName: 1,
        },
      },
    ]);
    let filter = "All"
    const userId = req.session.userId;
    let cartStatus = await cartModel.find({ user: userId });
    let cartDishCount = cartStatus[0]?.cartItems.length || 0;
    res.render("user/dishes", { dishes, categories, cartDishCount, filter });
  },

  searchProduct: async (req, res, next) => {
    try {
      let searchInput = req.body.searchInput;
      console.log(searchInput)
      const currentTime = format(new Date(), "HH:mm:ss");
      let batches = await batchModel.aggregate([
        {
          $match: {
            status: true,
          },
        },
        {
          $addFields: {
            startTime: {
              $substr: [
                {
                  $dateToString: {
                    format: "%H:%M:%S",
                    date: "$startingTime",
                    timezone: "Asia/Kolkata",
                  },
                },
                0,
                8,
              ],
            },
          },
        },
        {
          $addFields: {
            endTime: {
              $substr: [
                {
                  $dateToString: {
                    format: "%H:%M:%S",
                    date: "$closingTime",
                    timezone: "Asia/Kolkata",
                  },
                },
                0,
                8,
              ],
            },
          },
        },
        // {
        //   $match: {
        //     $or: [
        //       {
        //         batchName: "All Time",
        //       },
        //       {
        //         $and: [
        //           { startTime: { $lte: currentTime } },
        //           { endTime: { $gte: currentTime } },
        //         ],
        //       },
        //     ],
        //   },
        // },
        {
          $project: {
            _id: 0,
            dishes: 1,
          },
        },
      ]);
      let dishes = await batchModel.populate(batches, {
        path: "dishes",
        populate: [
          {
            path: "productCategory",
            ref: CATEGORY,
            select: "categoryName -_id",
          },
        ],
      });
      let categories = await categoryModel.aggregate([
        {
          $addFields: {
            productSize: {
              $cond: {
                if: { $isArray: "$dishes" },
                then: { $size: "$dishes" },
                else: 0,
              },
            },
          },
        },
        {
          $sort: {
            productSize: -1,
          },
        },
        {
          $project: {
            categoryName: 1,
          },
        },
      ]);
      const filteredDishes = dishes.filter((batch) => {
        batch.dishes = batch.dishes.filter((dish) => {
          return dish.productName.toLowerCase().includes(searchInput.toLowerCase());
        });
        return batch.dishes.length > 0;
      });
      dishes = filteredDishes;
      let filter = "All"
      const userId = req.session.userId;
      let cartStatus = await cartModel.find({ user: userId });
      let cartDishCount = cartStatus[0]?.cartItems.length || 0;
      res.render("user/dishes", { dishes, categories, cartDishCount, filter });
    } catch (error) {
      error.isRestCall = true;
      next(error);
    }
  },

  getDishFilterBasedOnType: async (req, res, next) => {
    try {
      let filter = req.query.type;
      const currentTime = format(new Date(), "HH:mm:ss");
      let batches = await batchModel.aggregate([
        {
          $match: {
            status: true,
          },
        },
        {
          $addFields: {
            startTime: {
              $substr: [
                {
                  $dateToString: {
                    format: "%H:%M:%S",
                    date: "$startingTime",
                    timezone: "Asia/Kolkata",
                  },
                },
                0,
                8,
              ],
            },
          },
        },
        {
          $addFields: {
            endTime: {
              $substr: [
                {
                  $dateToString: {
                    format: "%H:%M:%S",
                    date: "$closingTime",
                    timezone: "Asia/Kolkata",
                  },
                },
                0,
                8,
              ],
            },
          },
        },
        // {
        //   $match: {
        //     $or: [
        //       {
        //         batchName: "All Time",
        //       },
        //       {
        //         $and: [
        //           { startTime: { $lte: currentTime } },
        //           { endTime: { $gte: currentTime } },
        //         ],
        //       },
        //     ],
        //   },
        // },
        {
          $project: {
            _id: 0,
            dishes: 1,
          },
        },
      ]);
      let dishes = await batchModel.populate(batches, {
        path: "dishes",
        populate: [
          {
            path: "productCategory",
            ref: CATEGORY,
            select: "categoryName -_id",
          },
        ],
      });
      let categories = await categoryModel.aggregate([
        {
          $addFields: {
            productSize: {
              $cond: {
                if: { $isArray: "$dishes" },
                then: { $size: "$dishes" },
                else: 0,
              },
            },
          },
        },
        {
          $sort: {
            productSize: -1,
          },
        },
        {
          $project: {
            categoryName: 1,
          },
        },
      ]);
      const filteredDishes = dishes.filter((batch) => {
        batch.dishes = batch.dishes.filter((dish) => {
          return dish.productType.toLowerCase() == (filter.toLowerCase());
        });
        return batch.dishes.length > 0;
      });
      dishes = filteredDishes;
      const userId = req.session.userId;
      let cartStatus = await cartModel.find({ user: userId });
      let cartDishCount = cartStatus[0]?.cartItems.length || 0;
      res.render("user/dishes", { dishes, categories, cartDishCount, filter });
    } catch (error) {
      error.isRestCall = true;
      next(error);
    }
  },

  getDetailedView: async (req, res, next) => {
    try {
      let id = req.query.id;
      const userId = req.session.userId;
      const currentTime = format(new Date(), "HH:mm:ss");
      let batches = await batchModel.aggregate([
        {
          $match: {
            status: true,
          },
        },
        {
          $addFields: {
            startTime: {
              $substr: [
                {
                  $dateToString: {
                    format: "%H:%M:%S",
                    date: "$startingTime",
                    timezone: "Asia/Kolkata",
                  },
                },
                0,
                8,
              ],
            },
          },
        },
        {
          $addFields: {
            endTime: {
              $substr: [
                {
                  $dateToString: {
                    format: "%H:%M:%S",
                    date: "$closingTime",
                    timezone: "Asia/Kolkata",
                  },
                },
                0,
                8,
              ],
            },
          },
        },
        {
          $match: {
            $or: [
              {
                batchName: "All Time",
              },
              {
                $and: [
                  { startTime: { $lte: currentTime } },
                  { endTime: { $gte: currentTime } },
                ],
              },
            ],
          },
        },
        {
          $project: {
            _id: 0,
            dishes: 1,
          },
        },
      ]);
      let dishes = await batchModel.populate(batches, {
        path: "dishes",
        populate: [
          {
            path: "productCategory",
            ref: CATEGORY,
            select: "categoryName -_id",
          },
        ],
      });
      let categories = await categoryModel.aggregate([
        {
          $addFields: {
            productSize: {
              $cond: {
                if: { $isArray: "$dishes" },
                then: { $size: "$dishes" },
                else: 0,
              },
            },
          },
        },
        {
          $sort: {
            productSize: -1,
          },
        },
        {
          $project: {
            categoryName: 1,
          },
        },
      ]);
      let cartStatus = await cartModel.find({ user: userId });
      let cartDishCount = cartStatus[0]?.cartItems.length || 0;
      let product = await productModel.findById(id).populate("productCategory").populate({
        path: "review",
        populate: {
          path: "userId",
          model: "user",
        }
      })
      if (product) {
        res.render("user/dishDetailedView", { product, dishes, categories, cartDishCount });
      } else {
        const error = new Error("Product detailed view not available!");
        error.status = 400;
        throw error;
      }
    } catch (err) {
      next(err);
    }
  },

  postAddReview: async (req, res, next) => {
    try {
      const body = req.body;
      const userId = req.session.userId;

      if (userId) {
        const product = await productModel.findById(body.productId);
        const user = await userModel.findById(userId);
        if (!product) {
          const error = new Error("Product not found");
          error.status = 404;
          error.isRestCall = true;
          next(error);
        }

        const reviewIndex = product.review.findIndex(
          (review) => review.userId.toString() === userId.toString()
        );
        if (reviewIndex !== -1) {
          // Update existing review
          product.review[reviewIndex].rating = body.rating;
          product.review[reviewIndex].message = body.message;
        } else {
          // Add new review
          const review = {
            userId: userId,
            rating: body.rating,
            message: body.message,
            username: user.username,
          };
          product.review.push(review);
        }
        const ratingSum = product.review.reduce((acc, review) => {
          return acc + review.rating;
        }, 0);

        product.ratingScore = ratingSum / product.review.length;

        await product.save();
        res.status(200).send({ status: 200 });
      } else {
        const error = new Error("Only signed users can give ratings");
        error.status = 401;
        error.isRestCall = true;
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  addToCart: async (req, res, next) => {
    const userId = req.session.userId;
    let cart = await cartModel.find({ user: userId });
    if (!cart || cart.length <= 0) {
      const cartItems = [
        {
          product: req.body.productId,
          quantity: 1,
        },
      ];
      let created = await cartModel.create({
        user: userId,
        cartItems: cartItems,
      });
      if (!created) {
        console.error("Error creating cart");
      }
      res.status(200).json("Product is added to cart");
    } else {
      let newCartItem = cart[0].cartItems;
      let isNew = false;
      let existingProductIds = [];
      newCartItem = newCartItem.map((item) => {
        if (String(item.product) === String(req.body.productId)) {
          item.quantity += 1;
        }
        existingProductIds.push(String(item.product));
        return item;
      });
      const exists = existingProductIds.includes(req.body.productId);
      if (!exists) {
        isNew = true;
      }
      let result = "";
      if (!isNew) {
        result = await cartModel.findOneAndUpdate(
          { user: userId },
          { $set: { cartItems: newCartItem } },
          { new: true }
        );
      } else {
        const newItem = {
          product: req.body.productId,
          quantity: 1,
        };
        result = await cartModel.findOneAndUpdate(
          { user: userId },
          { $push: { cartItems: newItem } },
          { new: true }
        );
      }
      res.status(200).json("Dish added to cart");
    }
  },

  getviewcart: async (req, res, next) => {
    try {
      const userId = req.session.userId;
      const { cartData, addresses } = await getCartDetailsForCartPage(userId);
      res.render("user/cart", { cartData, addresses });
    } catch (err) {
      console.error(err.message);
      next(err);
    }
  },

  incrementCartItemQuantity: async (req, res, next) => {
    const userId = req.session.userId;
    const productId = req.body.productId;

    let cart = await cartModel.findOne({ user: userId });
    let cartItems = cart.cartItems;
    cartItems = cartItems.map((dish) => {
      if (String(dish.product) === String(productId)) {
        dish.quantity += 1;
      }
      return dish;
    });

    await cartModel.findOneAndUpdate(
      { user: userId },
      { $set: { cartItems: cartItems } },
      { new: true }
    );
    const { cartData } = await getCartDetailsForCartPage(userId);
    cartModel.findOne({ 'cartItems.product': productId })
      .populate({
        path: 'cartItems.product',
        select: 'productPrice',
      })
      .then((cart) => {
        if (cart === undefined) {
          return;
        }
        const cartItem = cart.cartItems.find((item) => item.product._id.toString() === productId.toString());
        const productPrice = cartItem.product.productPrice;
        const productQuantity = cartItem.quantity
        res.status(200).send({ status: 200, productPrice: productPrice, productQuantity: productQuantity, cartData: cartData })
      }).catch((err) => {
        console.log("Error :", err);
      });
  },

  decrementCartItemQuantity: async (req, res, next) => {
    const userId = req.session.userId;
    const productId = req.body.productId;
    let cart = await cartModel.findOne({ user: userId });
    let cartItems = cart.cartItems;
    cartItems = cartItems.map((dish) => {
      if (String(dish.product) === String(productId)) {
        if (dish.quantity <= 1) {
          return null;
        } else {
          dish.quantity -= 1;
        }
      }
      return dish;
    });
    cartItems = cartItems.filter((_) => _);
    await cartModel.findOneAndUpdate(
      { user: userId },
      { $set: { cartItems: cartItems } },
      { new: true }
    );
    const { cartData } = await getCartDetailsForCartPage(userId);
    console.log(cartData, "cartData")
    await cartModel.findOne({ 'cartItems.product': productId })
      .populate({
        path: 'cartItems.product',
        select: 'productPrice',
      })
      .then((cart) => {

        if (!cart) {
          return res.status(404).send({ status: 404 });
        }
        const cartItem = cart.cartItems.find((item) => item.product._id.toString() === productId.toString());
        const productPrice = cartItem.product.productPrice;
        const productQuantity = cartItem.quantity
        console.log(cartItem, productPrice, "cartItm")

        res.status(200).send({ status: 200, productPrice: productPrice, productQuantity: productQuantity, cartData: cartData })
      }).catch((err) => {

        console.log(err);
      });
  },

  deleteProductFromCart: async (req, res, next) => {
    try {
      const userId = req.session.userId;
      const productId = req.query.productId;

      let cart = await cartModel.findOne({ user: userId });
      if (!cart) {
        const error = new Error("Cart is yet to create for this user");
        error.status(404);
        throw error;
      }
      let cartItems = cart.cartItems;
      cartItems = cartItems.filter(
        (_) => String(_.product) !== String(productId)
      );
      await cartModel.findOneAndUpdate(
        { user: userId },
        { $set: { cartItems: cartItems } },
        { new: true }
      );

      res.redirect("/viewCart");
    } catch (err) {
      console.error(err.message);
      next(err);
    }
  },

  addAddress: async (req, res, next) => {
    try {
      let body = await addAddress.validateAsync(req.body);
      const userId = req.session.userId;
      body = { ...body, userId };
      const result = await addressModel.create(body);
      res.status(201).json(result);
    } catch (err) {
      console.error(err.message);
      err.isRestCall = true;
      next(err);
    }
  },

  getAddress: async (req, res, next) => {
    try {
      const addressId = req.params.addressId.slice(1, 25);
      const address = await addressModel.findById({ _id: addressId });
      if (!address) {
        const error = new Error("Address not found");
        error.status = 404;
        error.isRestCall = true;
        next(error);
      } else {
        res.status(200).send({ data: address });
      }
    } catch (error) {
      next(error);
    }
  },

  updateAddress: async (req, res, next) => {
    try {
      const body = await updateAddress.validateAsync(req.body);
      const addressId = body._id.slice(1, 25);
      const address = await addressModel.findByIdAndUpdate(
        { _id: addressId },
        {
          flatNo: body.flatNo,
          street: body.street,
          landmark: body.landmark,
          district: body.district,
          pincode: body.pincode
        });
      if (!address) {
        const error = new Error("Address not found");
        error.status = 404;
        error.isRestCall = true;
        next(error);
      } else {
        res.status(200).send({ data: address });
      }
    } catch (error) {
      next(error);
    }
  },

  deleteAddress: async (req, res, next) => {
    try {
      const addressId = req.body._id.slice(1, 25);
      const address = await addressModel.findByIdAndDelete({ _id: addressId });
      if (!address) {
        const error = new Error("Address not found");
        error.status = 404;
        error.isRestCall = true;
        next(error);
      } else {
        res.status(200).send({ data: address });
      }
    } catch (error) {
      next(error);
    }
  },

  applyCoupon: async (req, res, next) => {
    console.log("Req.body :", req.body);
    try {
      const body = await applyCouponValidator.validateAsync(req.body);
      const userId = req.session.userId;
      applyCoupon(userId, body.coupon).then(async (result) => {
        console.log("result :", result);
        const { cartData, addresses } = await getCartDetailsForCartPage(userId);
        res.render("user/cart", { cartData, addresses });
      })
        .catch((error) => {
          error.isRestCall = true;
          next(error);
        })
    } catch (error) {
      error.isRestCall = true;
      next(error);
    }
  },

  removeCoupon: async (req, res, next) => {
    try {
      const userId = req.session.userId;
      await removeCoupon(userId);
      const { cartData, addresses } = await getCartDetailsForCartPage(userId);
      res.render("user/cart", { cartData, addresses });
    } catch (error) {
      console.error(error.message);
      error.isRestCall = true;
      next(error);
    }
  },

  checkout: async (req, res, next) => {
    try {
      const body = await checkout.validateAsync(req.body);
      // const body = req.body;
      const userId = req.session.userId;
      console.log(body.grandTotal, "body.grandTotal")
      console.log(body.addressId, " body.addressId");
      const cartData = await getCartDetailsForCheckout(userId);
      console.log(cartData.grandTotal, "cartData.grandTotal");
      if (cartData.grandTotal) {
        await generateOrder(userId, body.addressId.slice(1, 25))
          .then((response) => {
            res.status(200).send({ data: response });
          })
          .catch((err) => {
            next(err.message);
          });
      } else {
        next("Cart is invalid");
      }
    } catch (error) {
      console.error(error.message);
      error.isRestCall = true;
      if (error.isJoi && error.message.includes("addressId")) {
        error.message = "Address not selected";
      }
      next(error);
    }
  },

  reviewPayment: async (req, res, next) => {
    try {
      const userId = req.session.userId;
      const orderId = req.query.orderId;
      const { cartData, addresses } = await getCartDetailsForCartPage(userId);
      res.render("user/reviewPayment", { cartData, addresses, orderId });
    } catch (error) {
      console.error(error.message);
      next(error);
    }
  },

  confirmOrder: async (req, res, next) => {
    try {
      console.log("confirm order :",);
      const { orderId, paymentMethod } =
        await orderValidator.confirmOrder.validateAsync(req.body);
      console.log("confirmOrder: orderId and paymentMethod :", orderId, paymentMethod);
      const WALLET = "Wallet";

      await confirmOrder(orderId, paymentMethod, req)
        .then((result) => {
          console.log("confirm Order Result :", result);
          res.status(201).send({ data: result });
        })
        .catch((err) => {
          next(err);
        });
    } catch (error) {
      console.error(error.message);
      error.isRestCall = true;
      next(error);
    }
  },

  orderConfirmed: async (req, res, next) => {
    try {
      const orderId = req.query.order_id;
      await updateConfirmOrder(orderId)
        .then((response) => {
          if (!response) {
            next(new Error('Cannot update order details'));
          }
          res.render("user/orderConfirmed", { response });
        })
        .catch((err) => {
          next(err)
        });
    } catch (error) {
      console.error(error.message);
      next(error);
    }
  },

  getOrders: async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const userId = req.session.userId;
    try {


      const orders = await orderModel.find({ userId: userId, isPlaced: true })
        .populate({
          path: "userId", // Populate the 'userId' field in the order document
          select: "username email phoneNumber" // Select the fields you want to retrieve from the user document
        }).populate({
          path: "addressId", // Populate the 'userId' field in the order document
          select: "flaNo street landmark district" // Select the fields you want to retrieve from the user document
        })
        .populate(
          {
            path: "orderItems",
            populate: {
              path: "product"
            }
          }
        )
        .sort({ orderId: -1 })
        .skip(skip) // Skip the specified number of orders based on current page
        .limit(limit);
      console.log('orders', orders);
      // Perform a lookup to retrieve address details based on addressId
      if (orders) {
        // If userId and addressId are available in the order
        var addressDetails = await addressModel.findOne({ _id: orders[2].addressId });
        if (addressDetails) {
          // Address details found, you can access them using addressDetails object
          console.log('Address Details:', addressDetails);
        } else {
          console.log('Address details not found.');
        }
      } else {
        console.log('User or address details not found in the order.');
      }

      const totalOrders = await orderModel.find({ userId: userId, isPlaced: true }).count();
      console.log("totalOrders", totalOrders);
      let cartStatus = await cartModel.find({ user: userId });
      let cartDishCount = cartStatus[0]?.cartItems.length || 0;
      res.render("user/orders", {
        orders, user: orders[1].userId, address: orders[2].addressId, cartDishCount, current: page,
        pages: Math.ceil(totalOrders / limit),
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  getOrderDetails: async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const userId = req.session.userId;
    try {


      const orders = await orderModel.find({ userId: userId, isPlaced: true })
        .populate({
          path: "userId", // Populate the 'userId' field in the order document
          select: "username email phoneNumber address" // Select the fields you want to retrieve from the user document
        })
        .populate(
          {
            path: "orderItems",
            populate: {
              path: "product"
            }
          }
        )
        .sort({ orderId: -1 })
        .skip(skip) // Skip the specified number of orders based on current page
        .limit(limit);
      const totalOrders = await orderModel.find({ userId: userId, isPlaced: true }).count();
      console.log("totalOrders", totalOrders);
      let cartStatus = await cartModel.find({ user: userId });
      let cartDishCount = cartStatus[0]?.cartItems.length || 0;
      res.render("user/orderDetails", {
        orders, user: orders[1].userId, cartDishCount, current: page,
        pages: Math.ceil(totalOrders / limit),
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
    // const userId = req.session.userId;
    // try {


    //   const orderId = req.params.orderId;

    //   // Fetch order details based on orderId (implement this logic)
    //   const order = await orderModel.findOne({ _id: orderId }).populate('userId').populate('addressId').populate('orderItems.product');
    //   console.log("order", order)
    //   if (!order) {
    //     return res.status(404).send('Order not found');
    //   }
    //   let cartStatus = await cartModel.find({ user: userId });
    //   let cartDishCount = cartStatus[0]?.cartItems.length || 0;
    //   res.render('user/orderDetails', { order: order, cartDishCount });
    // } catch (error) {
    //   console.error(error);
    //   res.status(500).send('Internal Server Error');
    // }
  },
  getProfile: async (req, res, next) => {
    const userId = req.session.userId;
    const user = await userModel.findById(userId).populate("address")
    let cartStatus = await cartModel.find({ user: userId });
    let cartDishCount = cartStatus[0]?.cartItems.length || 0;
    res.render('user/profile', { user, cartDishCount })
  },

  editUserInfo: async (req, res, next) => {
    const body = req.body;
    const userId = req.session.userId;
    console.log(body)
    await userModel.updateOne({ _id: userId }, {
      $set: {
        username: body.username,
        fullname: body.fullname,
        phoneNumber: body.phoneNumber,
        email: body.email
      }
    })
    res.status(200).send({ status: 200 })
  },

  resetPassword: async (req, res, next) => {
    const userId = req.session.userId
    const body = req.body;
    const user = await userModel.findById(userId)
    const passwordMatch = await bcrypt.compare(
      body.currentPassword,
      user.password
    );
    if (passwordMatch) {
      const hashedPassword = await securePassword(body.newPassword);
      await userModel.updateOne({ _id: userId }, {
        $set: {
          password: hashedPassword
        }
      })
      res.status(200).send({ status: 200 })
    } else {
      res.status(401).send({ status: 401 })
    }
  },

  getAbout: async (req, res, next) => {
    res.render('user/about')
  },

  getContact: async (req, res, next) => {
    res.render('user/contact')
  },

  subscribeNewsletter: async (req, res, next) => {
    try {
      const email = new mailCampaignModel({
        email: req.body.email
      })
      await email.save();
      res.status(200).send({ status: 200 })
    } catch (error) {
      next(error)
    }
  },

  sendMessage: async (req, res, next) => {
    try {
      const body = req.body
      sendMessageToAdmin(body.name, body.message);
      console.log(body);
      res.status(200).send({ status: 200 })
    } catch (error) {
      next(error)
    }
  },
  cancelOrder: async (req, res) => {
    const { orderId } = req.body;
    console.log("orderId :", orderId);
    // Find the order in the orders array by orderId
    try {
      const order = await orderModel.findOne({ orderId: orderId });
      console.log("order", order);

      if (order) {
        const user = await userModel.findOne({ _id: order.userId })

        // Update order status to 'cancelled'
        if (user) {
          if (order.paymentMethod === PaymentMethod.ONLINE || order.paymentMethod === PaymentMethod.WALLET) {
            let walletData = {
              transactionType: 'Credited',
              amount: order.billAmount
            }

            user.wallets = [...user.wallets, walletData];
            console.log("walletData and wallets", walletData, user.wallets)
            // Update wallet balance by adding the cancelled order's amount
            user.walletBalance += order.billAmount;
          }
          // Update order status to 'cancelled'
          order.orderStatus = 'cancelled';

          // Save the updated user information and order status in the database
          await Promise.all([user.save(), order.save()]);
          //res.render('user/order');
          res.json({ success: true, message: 'Order has been cancelled successfully. Amount added to wallet.' });

        } else {
          res.json({ success: false, message: 'User not found.' });
        }
      } else {
        res.json({ success: false, message: 'Order not found.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to cancel the order. Please try again.' });
    }


  }
}
