const express = require('express')
const {
    getSingleOrder, getUserOrders, getOrders, createOrder
} = require('../controllers/orderController')

const requireAuth = require('../middleware/requireAuth')
const router = express.Router()

router.post('/create', createOrder)

router.use(requireAuth)
router.get('/:id', getSingleOrder)
router.get('/', getOrders)
router.get('/user/:id', getUserOrders)



module.exports = router