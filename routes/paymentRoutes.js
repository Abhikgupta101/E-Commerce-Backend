const express = require('express')
const {
    checkout
} = require('../controllers/paymentController')

const requireAuth = require('../middleware/requireAuth')
const router = express.Router()

router.post('/create', checkout)

router.use(requireAuth)

module.exports = router