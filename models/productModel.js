const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please Enter product Name"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Please Enter product Description"],
    },
    price: {
        type: Number,
        required: [true, "Please Enter product Price"],
        maxLength: [8, "Price cannot exceed 8 characters"],
    },
    image: {
        type: String,
        required: [true, "Please Upload Product's Image"],
    },
    brand: {
        type: String,
        required: [true, "Please Enter Brand Name"],
    },
    sizes: {
        type: [String],
        required: [true, "Please select size"]
    },
    gender: {
        type: [String],
        required: [true, "Please select gender"]
    },
    stock: {
        type: Number,
        required: [true, "Please Enter product Stock"],
        maxLength: [4, "Stock cannot exceed 4 characters"],
        default: 1,
    },
    user_id: {
        type: String,
        required: true,
    },
    reviews: [{
        text: { type: String },
        user_id: { type: String },
        user_name: { type: String },
        avatar: { type: String },
        updatedAt: { type: Date }

    }, { timestamps: true }],
    add_cart: [{ type: String }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true })

productSchema.index({ name: "text" })

module.exports = mongoose.model('Product', productSchema)