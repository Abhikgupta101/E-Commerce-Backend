// const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const mongoose = require('mongoose')

//get all orders


const getSingleOrder = async (req, res) => {
    const { id } = req.params
    try {
        const order = await Order.find({ order_id: id })
        res.status(200).json(order)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}


const getUserOrders = async (req, res) => {
    const { id } = req.params
    try {
        const order = await Order.find({ user_id: id }).sort({ createdAt: -1 })
        res.status(200).json(order)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getOrders = async (req, res) => {

    try {
        const order = await Order.find().sort({ createdAt: -1 })
        res.status(200).json(order)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const createOrder = async (req, res) => {
    const { order_id, total_order, products, user_name, address, user_id, payment } = req.body
    try {
        const order = await Order.create(
            {
                order_id, total_order, products, user_name, address, user_id, payment
            }
        )
        res.status(200).json(order)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    getSingleOrder,
    getUserOrders,
    getOrders,
    createOrder
}