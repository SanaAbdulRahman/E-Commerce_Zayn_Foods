const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");

const getCategoriesForAdminCategoryManagement = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let categories = await categoryModel.find({});
      categories = await categories.map(async(category) => {
        return {
          ...category,
          products: await getProductsForCategories(category._id),
        };
      });
      console.log(categories);
      resolve(categories);
    } catch (error) {
      reject(error.message);
    }
  });
};

const getProductsForCategories = async (categoryId) => {
  try {
    let products = await productModel
      .find({ productCategory: categoryId })
      .select("productName");
    return products;
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = getCategoriesForAdminCategoryManagement;
