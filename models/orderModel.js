const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = mongoose.Schema({
    order_id: {
        type: String,
        required: true,
    },
    total_order: {
        type: Number,
        required: true,
    },
    products: {
        type: Array,
        required: true,
    },
    user_id: {
        type: String,
    },
    user_name: {
        type: String,
        required: true,
    },
    address: {
        type: Array,
        required: true,
    },
    payment: {
        type: Array,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model("Orders", orderSchema);