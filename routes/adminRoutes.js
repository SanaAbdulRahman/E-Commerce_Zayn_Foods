const express = require ('express');
const adminController = require('../controller/adminCtrl');
const upload = require("../middlewares/uploadImages")
const session = require('../middlewares/session');
const uploadSingle = require('../middlewares/bannerUploadImage');
const router = express.Router();


router.get('/', session.verifyAdmin, adminController.getAdmin);

router.post('/postAdminLogin', adminController.postAdminLogin);

router.get('/getAdminSignout', session.verifyAdmin, adminController.getAdminSignout);

router.get('/getDashboardData', adminController.getDashboardData);

router.get('/getBannerMangement', adminController.getBannerMangement);

router.get("/getAddSlider", session.verifyAdmin, adminController.getAddSlideBanner);

router.post("/postAddSlider", session.verifyAdmin, uploadSingle,  adminController.postAddSlideBanner);

router.get("/getEditSlider", session.verifyAdmin, adminController.getEditSlideBanner);

router.post("/postEditSlider", session.verifyAdmin, uploadSingle,  adminController.postEditSlideBanner);

router.get('/removeSlider', session.verifyAdmin, adminController.removeSlider);

router.get('/getAddOfferBox', session.verifyAdmin, adminController.getAddOfferBox);

router.post('/postAddOfferBox', session.verifyAdmin, uploadSingle, adminController.postAddOfferBox);

router.get('/getEditOfferBox', session.verifyAdmin, adminController.getEditOfferBox);

router.post('/postEditOfferBox', session.verifyAdmin, uploadSingle, adminController.postEditOfferBox);

router.get('/removeOfferBox', session.verifyAdmin, adminController.removeOfferBox);

router.get('/getUserManagement', session.verifyAdmin, adminController.getUserManagement);

router.get('/blockUser/:id', session.verifyAdmin, adminController.blockUser);

router.get('/unblockUser/:id', session.verifyAdmin, adminController.unblockUser);

router.get('/adminDishes', session.verifyAdmin, adminController.getAdminDishes);

router.get('/getAddProducts', session.verifyAdmin, adminController.getAddProducts);

router.post("/postAddProduct", upload, adminController.postAddProduct);

router.get('/getEditProducts', session.verifyAdmin, adminController.getEditProducts);

router.post('/postEditProduct',upload, adminController.postEditProducts);

router.get('/activeProduct', session.verifyAdmin, adminController.activeProduct);

router.get('/activeFalseProduct', session.verifyAdmin, adminController.activeFalseProduct);

router.get('/permanentDeleteProduct', session.verifyAdmin, adminController.permanentDeleteProduct);

router.get('/getCategoryManagement', session.verifyAdmin, adminController.getCategoryManagement);

router.get('/getAddCategory', session.verifyAdmin, adminController.getAddCategory);

router.post('/postAddCategory', adminController.postAddCategory);

router.get('/getEditCategory', session.verifyAdmin, adminController.getEditCategory);

router.post('/postEditCategory', adminController.postEditCategory);

router.get('/getDeleteCategory', session.verifyAdmin, adminController.deleteCategory);

router.get('/getAdminOrders', session.verifyAdmin, adminController.getAdminOrders)

router.get('/orderOnTheWay', session.verifyAdmin, adminController.orderOnTheWay);

router.get('/cancelOrder', session.verifyAdmin, adminController.OrderCancel);

router.get('/orderDelivered', session.verifyAdmin, adminController.OrderDelivered);

router.get('/getCouponManagement', session.verifyAdmin, adminController.getCouponManagement);

router.get('/getAddCoupon' , session.verifyAdmin, adminController.getAddCoupon);

router.post('/postAddCoupon', adminController.postAddCoupon)

router.get('/editCoupon', session.verifyAdmin, adminController.getEditCoupon);

router.post('/postEditCoupon', adminController.postEditCoupon);

router.get('/deleteCoupon', session.verifyAdmin, adminController.deleteCoupon)

router.get('/getBatchManagement', session.verifyAdmin, adminController.getBatchManagement);

router.get('/getAddBatch', session.verifyAdmin, adminController.getAddBatch);

router.post('/postAddBatch', adminController.postAddBatch);

router.get('/getEditBatch', session.verifyAdmin, adminController.getEditBatch);

router.post('/postEditBatch', adminController.postEditBatch);

router.get('/getDeleteBatch', session.verifyAdmin, adminController.getDeleteBatch);

router.get('/getActiveBatch', session.verifyAdmin, adminController.getActiveBatch);

router.get('/getDeactivateBatch', session.verifyAdmin, adminController.getDeactivateBatch);


module.exports = router;