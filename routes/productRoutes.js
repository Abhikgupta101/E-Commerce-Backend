const express = require('express')
const {
    getProduct, singleProduct, createProduct, deleteProduct, addCart, removeCart, emptyCart, fetchCart, filterProduct,
    addReview, deleteReview
} = require('../controllers/productController')
const requireAuth = require('../middleware/requireAuth')
const router = express.Router()

//middleware
router.get('/', getProduct)
router.get('/product/:id', singleProduct)
router.get('/filter', filterProduct)
router.post('/emptyCart/:id', emptyCart)
router.use(requireAuth)

//routes

router.post('/create', createProduct)
router.post('/addCart/:id', addCart)
router.post('/removeCart/:id', removeCart)
router.get('/cart', fetchCart)
router.post('/addReview/:id', addReview)
router.post('/deleteReview/:id', deleteReview)
router.get('/delete/:id', deleteProduct)

module.exports = router