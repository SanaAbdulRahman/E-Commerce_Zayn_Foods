const express = require ('express');
const userController = require('../controller/userCtrl');
const router = express.Router();

router.get('/', (req, res)=>{
    res.render("index")
})

router.get('/home', (req, res)=>{
    res.render("home")
})

router.get('/dishes', (req, res)=>{
    res.render("dishes")
})

router.get('/dishSingleView', (req, res)=>{
    res.render("dishSingleView")
})

router.get('/about',(req,res)=>{
    res.render('about')
})

router.get('/shopingCart',(req,res)=>{
    res.render('shopingCart')
})


router.get('/orders',(req,res)=>{
    res.render('orders')
})

router.get('/contact',(req,res)=>{
    res.render('contact')
})

router.get('/admin',(req,res)=>{
    res.render('admin')
})

router.get('/adminOrders',(req,res)=>{
    res.render('adminOrders')
})

router.get('/adminDishes',(req,res)=>{
    res.render('adminDishes')
})

router.get('/Usermanagement',(req,res)=>{
    res.render('Usermanagement')
})

router.get('/addProducts',(req,res)=>{
    res.render('addProducts')
})

router.get('/editProducts',(req,res)=>{
    res.render('editProducts')
})

router.get('/adminLogin',(req,res)=>{
    res.render('adminLogin')
})


router.get('/new', (req, res)=>{
    res.render("admin/userManagement")
})

module.exports = router;