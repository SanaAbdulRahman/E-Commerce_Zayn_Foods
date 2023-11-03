const userModel = require("../models/userModel");
const sliderModel = require("../models/sliderModel");
const offerBoxModel = require("../models/offerBoxModel");
const { getDishesForDishesList, getCategoriesForDishesList } = require("../services/dishesListService");

module.exports = {
  verifyAdmin: (req, res, next) => {
    if (req.session.admin) {
      next();
    } else {
      res.render("admin/adminLogin");
    }
  },
  verifyUser: async (req, res, next) => {
    const userData = await userModel.findById(req.session.userId);
    const slider = await sliderModel.find();
    const offerBox = await offerBoxModel.find();
    let userBlock = false;
    const dishes = await getDishesForDishesList();
    const categories = await getCategoriesForDishesList();
    console.log("verify user :", userData);
    if (req.session.user && userData) {
      userBlock = userData.isBlocked;
      if (userBlock) {
        req.session.user = false;
        const body = { generatedOTP: null, userBlockSwal: userBlock };
        res.render("user/index", { body, dishes, slider, offerBox, categories });

      }
      next();
    } else {
      console.log("session out", userData);
      // const body = { generatedOTP: null };
      // res.render("user/index", { body, dishes, categories, slider, offerBox, userBlockSwal: false });
      res.redirect('/');
      //next();
    }
  },
};
