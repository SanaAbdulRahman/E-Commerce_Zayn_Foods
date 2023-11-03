const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const couponModel = require("../models/couponModel");
const categoryModel = require("../models/categoryModel");
const batchModel = require("../models/batchModel");
const sliderModel = require("../models/sliderModel");
const offerBoxModel = require("../models/offerBoxModel");
const dateFns = require("date-fns");
const { uploadImage } = require("../services/admin/productService");
const { uploadSingleImage } = require("../services/admin/singleImageService");


module.exports = {
  getAdmin: async (req, res, next) => {
    try {
      //dashboard updated
      const revenueAndSalesByMonth = await orderModel.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: '$billAmount' },
            sales: { $sum: 1 }
          }
        }
      ]);
      const revenueByMonth = {
        jan : "",
        feb : "",
        mar : "",
        apr : "",
        may : "",
        jun : "",
        jul : "",
        aug : "",
        sep : "",
        oct : "",
        nov : "",
        dec : ""
      };
      let totalRevenue = 0;
      let totalSales = 0;
      revenueAndSalesByMonth.forEach(item => {
        totalRevenue += item.revenue;
        totalSales += item.sales;
      });

      revenueAndSalesByMonth.forEach(item => {
        const month = new Date(Date.UTC(2022, item._id - 1, 1)).toLocaleString('default', { month: 'short' });
        revenueByMonth[month.toLowerCase()] = item.revenue;
      });

      const userCount = await userModel.countDocuments();
      const productCount = await productModel.countDocuments();
      const dashboardData = {
        revenueByMonth,
        totalRevenue,
        totalSales,
        userCount,
        productCount
      }
      res.render("admin/admin", {dashboardData, revenueByMonth});
    } catch (error) {
      next(error)
    }
  },

  getDashboardData: async (req, res, next) => {
    try {
      const revenueAndSalesByMonth = await orderModel.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: '$billAmount' },
            sales: { $sum: 1 }
          }
        }
      ]);
      const revenueByMonth = {};
      let totalRevenue = 0;
      let totalSales = 0;
      revenueAndSalesByMonth.forEach(item => {
        revenueByMonth[item._id] = {
          revenue: item.revenue,
          sales: item.sales
        };
        totalRevenue += item.revenue;
        totalSales += item.sales;
      });

      const userCount = await userModel.countDocuments();
      const productCount = await productModel.countDocuments();
      console.log(revenueByMonth)
      res.send({
        revenueByMonth,
        totalRevenue,
        totalSales,
        userCount,
        productCount
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  postAdminLogin: async (req, res, next) => {
    try {
      if (
        req.body.username === process.env.ADMIN_USERNAME &&
        req.body.password === process.env.ADMIN_PASSWORD
      ) {
        req.session.admin = true;
        res.status(200).send({ status: 200 })
      } else {
        res.status(401).send({ status: 401 })
      }
    } catch (error) {
      next(error)
    }
  },

  getAdminSignout: async (req, res, next) => {
    try {
      delete req.session.admin;
      res.redirect("/admin");
    } catch (error) {
      next(error)
    }
  },

  getBannerMangement: async (req, res, next) => {
    try {
      const slider = await sliderModel.find();
      const offerBox = await offerBoxModel.find();
      res.render("admin/bannerManagement", { slider, offerBox })
    } catch (error) {
      next(error)
    }
  },

  getAddSlideBanner: async (req, res, next) => {
    try {
      res.render("admin/addSlider")
    } catch (error) {
      next(error)
    }
  },

  postAddSlideBanner: async (req, res, next) => {
    try {
      await uploadSingleImage(req).then(async (result) => {
        const image = result.urls.newPath ? result.urls.newPath : ""

        const slider = new sliderModel({
          primaryText: req.body.primaryText,
          altText: req.body.altText,
          image: image
        })
        await slider.save()
        res.redirect('../admin/getBannerMangement')
      })
    } catch (error) {
      next(error)
    }
  },

  getEditSlideBanner: async (req, res, next) => {
    const slideId = req.query.slideId;
    const slide = await sliderModel.findById(slideId);
    res.render("admin/editSlider", { slide });
  },

  postEditSlideBanner: async (req, res, next) => {
    try {
      await uploadSingleImage(req).then(async (result) => {
        const image = result.urls.newPath ? result.urls.newPath : req.body.image
        await sliderModel.updateOne({ _id: req.body.slideId }, {
          primaryText: req.body.primaryText,
          altText: req.body.altText,
          image: image
        })
      })
      res.redirect('../admin/getBannerMangement')
    } catch (error) {
      next(error)
    }
  },

  removeSlider: async (req, res, next) => {
    try {
      const slideId = req.query.slideId;
      await sliderModel.findByIdAndRemove(slideId);
      res.redirect('../admin/getBannerMangement')
    } catch (error) {
      next(error)
    }
  },

  getAddOfferBox: async (req, res, next) => {
    try {
      res.render("admin/addOfferBox")
    } catch (error) {
      next(error)
    }
  },

  postAddOfferBox: async (req, res, next) => {
    try {
      await uploadSingleImage(req).then(async (result) => {
        const image = result.urls.newPath ? result.urls.newPath : ""
        const offerBox = new offerBoxModel({
          name: req.body.name,
          price: req.body.price,
          link: req.body.link,
          image: image
        })
        await offerBox.save()
        res.redirect('../admin/getBannerMangement')
      })
    } catch (error) {
      next(error)
    }
  },

  getEditOfferBox: async (req, res, next) => {
    try {
      const offerId = req.query.offerId;
      const offer = await offerBoxModel.findById(offerId);
      res.render('admin/editOfferBox', { offer });
    } catch (error) {
      next(error)
    }
  },

  postEditOfferBox: async (req, res, next) => {
    try {
      await uploadSingleImage(req).then(async (result) => {
        const image = result.urls.newPath ? result.urls.newPath : req.body.image
        await offerBoxModel.updateOne({ _id: req.body.offerId }, {
          name: req.body.name,
          price: req.body.price,
          link: req.body.link,
          image: image
        })
        res.redirect('../admin/getBannerMangement')
      })
    } catch (error) {
      next(error)
    }
  },

  removeOfferBox: async (req, res, next) => {
    try {
      const offerId = req.query.offerId;
      await offerBoxModel.findByIdAndRemove(offerId);
      res.redirect('../admin/getBannerMangement')
    } catch (error) {
      next(error)
    }
  },

  getAdminDishes: async (req, res, next) => {
    try {
      let products = await productModel
        .find({})
        .populate("productCategory")
        .populate("productBatch");
      res.render("admin/adminDishes", { products });
    } catch (error) {
      next(error)
    }
  },

  getAddProducts: async (req, res, next) => {
    try {
      let categories = await categoryModel.find({});
      let batches = await batchModel.find({});
      res.render("admin/addProducts", { categories, batches });
    } catch (error) {
      next(error)
    }
  },

  postAddProduct: async (req, res, next) => {
    try {
      await uploadImage(req).then(async (result) => {
        const image1 = result.urls.has("productImage1") ? result.urls.get("productImage1") : ""
        const image2 = result.urls.has("productImage2") ? result.urls.get("productImage2") : ""
        const image3 = result.urls.has("productImage3") ? result.urls.get("productImage3") : ""

        const product = new productModel({
          productName: req.body.productName,
          productPrice: req.body.productPrice,
          productCategory: req.body.productCategory,
          productBatch: req.body.productBatch,
          productServings: req.body.productServings,
          productType: req.body.productType,
          productDescription: req.body.productDescription,
          productImage1: image1,
          productImage2: image2,
          productImage3: image3,
        });
        await product.save();

        await categoryModel.updateOne(
          { _id: req.body.productCategory },
          { $push: { dishes: product._id } }
        );

        await batchModel.updateOne(
          { _id: req.body.productBatch },
          { $push: { dishes: product._id } }
        );
        console.log(product)
        res.redirect("../admin/adminDishes");
      })
        .catch((error) => {
          console.log(error)
          next(error)
        })

    } catch (error) {
      next(error)
    }
  },

  getEditProducts: async (req, res, next) => {
    try {
      const id = req.query.id;
      const dishData = await productModel
        .findOne({ _id: id })
        .populate("productCategory")
        .populate("productBatch");
      let batches = await batchModel.find({});
      let categories = await categoryModel.find({});
      res.render("admin/editProducts", { dishData, batches, categories });
    } catch (error) {
      next(error)
    }
  },

  postEditProducts: async (req, res, next) => {
    try {
      await uploadImage(req).then(async (result) => {
        const image1 = result.urls.has("productImage1") ? result.urls.get("productImage1") : req.body.image1
        const image2 = result.urls.has("productImage2") ? result.urls.get("productImage2") : req.body.image2
        const image3 = result.urls.has("productImage3") ? result.urls.get("productImage3") : req.body.image3
        await productModel.updateOne(
          { _id: req.body.id },
          {
            productName: req.body.productName,
            productPrice: req.body.productPrice,
            productCategory: req.body.productCategory,
            productBatch: req.body.productBatch,
            productServings: req.body.productServings,
            productDescription: req.body.productDescription,
            productType: req.body.productType,
            productImage1: image1,
            productImage2: image2,
            productImage3: image3,
          }
        );
        await categoryModel.updateOne(
          { _id: req.body.productCategory },
          { $addToSet: { dishes: req.body.id } }
        );

        await batchModel.updateOne(
          { _id: req.body.productBatch },
          { $addToSet: { dishes: req.body.id } }
        );
      }).catch((error) => {
        console.error(error, "1")
        next(error)
      })
      res.redirect("../admin/adminDishes");
    } catch (error) {
      next(error)
    }
  },

  activeProduct: async (req, res, next) => {
    try {
      const id = req.query.id;
      await productModel.updateOne({ _id: id }, { $set: { active: true } });
      res.redirect("../admin/adminDishes");
    } catch (error) {
      next(error)
    }
  },

  activeFalseProduct: async (req, res, next) => {
    try {
      const id = req.query.id;
      await productModel.updateOne({ _id: id }, { $set: { active: false } });
      res.redirect("../admin/adminDishes");
    } catch (error) {
      next(error)
    }
  },

  permanentDeleteProduct: async (req, res, next) => {
    try {
      const id = req.query.id;
      await productModel.deleteOne({ _id: id });
      res.redirect("../admin/adminDishes");
    } catch (error) {
      next(error)
    }
  },

  getCategoryManagement: async (req, res, next) => {
    try {
      let category = await categoryModel.find({}).populate("dishes");
      res.render("admin/categoryManagement", { category });
    } catch (error) {
      next(error)
    }
  },

  getAddCategory: async (req, res, next) => {
    res.render("admin/addCategory");
  },

  postAddCategory: async (req, res, next) => {
    try {
      let category = new categoryModel(req.body);
      category.save();
      res.redirect("../admin/getCategoryManagement");
    } catch (error) {
      next(error)
    }
  },

  getEditCategory: async (req, res, next) => {
    try {
      let id = req.query.id;
      let category = await categoryModel.findOne({ _id: id });
      res.render("admin/editCategory", { category });
    } catch (error) {
      next(error)
    }
  },

  postEditCategory: async (req, res, next) => {
    try {
      let category = req.body;
      await categoryModel.updateOne(
        { _id: category.id },
        {
          categoryName: category.categoryName,
          description: category.description,
        }
      );
      res.redirect("../admin/getCategoryManagement");
    } catch (error) {
      next(error)
    }
  },

  deleteCategory: async (req, res, next) => {
    try {
      await categoryModel.deleteOne({ _id: req.query.id });
      res.redirect("../admin/getCategoryManagement");
    } catch (error) {
      next(error)
    }
  },

  getAdminOrders: async (req, res, next) => {
    try {
      let orders = await orderModel
        .find({ isPlaced: true })
        .populate("userId")
        .populate("addressId")
        .populate({ path: "orderItems.product", model: "product" });
      console.log(orders)
      res.render("admin/adminOrders", { orders });
    } catch (error) {
      next(error)
    }
  },

  orderOnTheWay: async (req, res, next) => {
    try {
      const id = req.query.id;
      await orderModel.updateOne(
        { _id: id },
        { $set: { orderStatus: "Processing" } }
      );
      res.redirect("../admin/getAdminOrders");
    } catch (error) {
      next(error)
    }
  },

  OrderCancel: async (req, res, next) => {
    try {
      const id = req.query.id;
      await orderModel.deleteOne({ _id: id });
      res.redirect("../admin/getAdminOrders");
    } catch (err) {
      next(error)
    }
  },

  OrderDelivered: async (req, res, next) => {
    try {
      const id = req.query.id;
      await orderModel.updateOne(
        { _id: id },
        { $set: { orderStatus: "delivered" } }
      );
      res.redirect("../admin/getAdminOrders");
      // res.render("admin/adminOrders", { orders });
    } catch (error) {
      next(error)
    }
  },

  getUserManagement: async (req, res, next) => {
    try {
      let users = await userModel.find({}).populate("address");
      res.render("admin/userManagement", { users });
    } catch (error) {
      next(error)
    }
  },

  blockUser: async (req, res, next) => {
    try {
      const id = req.params.id;
      await userModel
        .updateOne({ _id: id }, { $set: { isBlocked: true } })
        .then(() => {
          res.redirect("../../admin/getUserManagement");
        });
    } catch (error) {
      next(error)
    }
  },

  unblockUser: async (req, res, next) => {
    try {
      const id = req.params.id;
      await userModel
        .updateOne({ _id: id }, { $set: { isBlocked: false } })
        .then(() => {
          res.redirect("../../admin/getUserManagement");
        });
    } catch (error) {
      next(error)
    }
  },

  getCouponManagement: async (req, res, next) => {
    try {
      let coupon = await couponModel.find({});
      res.render("admin/couponManagement", { coupon });
    } catch (error) {
      next(error)
    }
  },

  getAddCoupon: async (req, res, next) => {
    try {
      let dish = await productModel.find({}).select("productName");
      res.render("admin/addCoupon", { dish });
    } catch (error) {
      next(error)
    }
  },

  postAddCoupon: async (req, res, next) => {
    try {
      let coupon = new couponModel(req.body);
      coupon.save();
      res.redirect("../admin/getCouponManagement");
    } catch (error) {
      next(error)
    }
  },

  getEditCoupon: async (req, res, next) => {
    try {
      const id = req.query.id;
      const couponData = await couponModel.findOne({ _id: id });
      res.render("admin/editCoupon", { couponData });
    } catch (error) {
      next(error)
    }
  },

  postEditCoupon: async (req, res, next) => {
    try {
      let coupon = req.body;
      await couponModel.updateOne(
        { _id: coupon.id },
        {
          couponName: coupon.couponName,
          couponCode: coupon.couponCode,
          discount: coupon.discount,
          ordersAbove: coupon.ordersAbove,
          maxUseCount: coupon.maxUseCount
        }
      );
      res.redirect("../admin/getCouponManagement");
    } catch (error) {
      next(error)
    }
  },

  deleteCoupon: async (req, res, next) => {
    const id = req.query.id;
    await couponModel.deleteOne({ _id: id });
    res.redirect("../admin/getCouponManagement");
  },

  getBatchManagement: async (req, res, next) => {
    try {
      let batch = await batchModel.find({}).populate("dishes");
      res.render("admin/batchManagement", { batch });
    } catch (error) {
      next(error)
    }
  },

  getAddBatch: async (req, res, next) => {
    try {
      let dishes = await batchModel.find({});
      res.render("admin/addBatch");
    } catch (error) {
      next(error)
    }
  },

  postAddBatch: async (req, res, next) => {
    try {
      let startingTime = dateFns.parse(
        req.body.startingTime,
        "HH:mm",
        new Date()
      );
      let closingTime = dateFns.parse(
        req.body.closingTime,
        "HH:mm",
        new Date()
      );
      const body = {
        ...req.body,
        startingTime: startingTime,
        closingTime: closingTime,
      };
      let batch = new batchModel(body);
      batch.save();
      res.redirect("../admin/getBatchManagement");
    } catch (error) {
      next(error)
    }
  },

  getEditBatch: async (req, res, next) => {
    try {
      let id = req.query.id;
      let batch = await batchModel.findOne({ _id: id });
      batch._doc.startingTime = new Date(
        batch.startingTime
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      batch._doc.closingTime = new Date(batch.closingTime).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      );

      console.log(batch);
      res.render("admin/editBatch", { batch });
    } catch (error) {
      next(error)
    }
  },

  postEditBatch: async (req, res, next) => {
    try {
      let batch = req.body;
      let startingTime = dateFns.parse(
        req.body.startingTime,
        "HH:mm",
        new Date()
      );
      let closingTime = dateFns.parse(
        req.body.closingTime,
        "HH:mm",
        new Date()
      );
      console.log(startingTime, "start");
      console.log(closingTime, "closing");
      await batchModel.updateOne(
        { _id: batch.id },
        {
          batchName: batch.batchName,
          startingTime: startingTime,
          closingTime: closingTime,
          description: batch.description,
        }
      );
      res.redirect("../admin/getBatchManagement");
    } catch (error) {
      next(error)
    }
  },

  getDeleteBatch: async (req, res, next) => {
    try {
      await batchModel.deleteOne({ _id: req.query.id });
      res.redirect("../admin/getBatchManagement");
    } catch (error) {
      next(error)
    }
  },

  getActiveBatch: async (req, res, next) => {
    try {
      const id = req.query.id;
      await batchModel.updateOne({ _id: id }, { $set: { status: false } });
      res.redirect("../admin/getBatchManagement");
    } catch (error) {
      next(error)
    }
  },

  getDeactivateBatch: async (req, res, next) => {
    try {
      const id = req.query.id;
      await batchModel.updateOne({ _id: id }, { $set: { status: true } });
      res.redirect("../admin/getBatchManagement");
    } catch (error) {
      next(error)
    }
  },
};
