const Product = require('../models/productModel')
const User = require('../models/userModel')
const mongoose = require('mongoose')

//get all products
const getProduct = async (req, res) => {

    try {
        const product = await Product.find().sort({ createdAt: -1 })
        // .limit().skip(2)
        res.status(200).json(product)
    }
    catch (error) {
        res.status(400).json({ error: error.review })
    }
}

const singleProduct = async (req, res) => {
    const { id } = req.params
    try {
        const product = await Product.findById({ _id: id })
        return res.status(200).json(product)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

//create products
const createProduct = async (req, res) => {
    const user_id = req.user._id
    console.log(req.body.name, req.body.description, req.body.sizes, req.body.brand, req.body.gender, req.body.price, req.body.image, req.body.stock)
    try {
        const user = await User.findById({ _id: user_id })
        const product = await Product.create(
            {
                name: req.body.name,
                description: req.body.description,
                sizes: req.body.sizes,
                brand: req.body.brand,
                gender: req.body.gender,
                price: req.body.price,
                image: req.body.image,
                // category: req.body.category,
                stock: req.body.stock,
                reviews: [],
                add_cart: [],
                user_id,
            }
        )
        await user.updateOne({ $push: { "products": product._id } }) //stoing post id in particular user
        res.status(200).json(product)
    }
    catch (error) {
        res.status(400).json({ error })
    }
}

const deleteProduct = async (req, res) => {
    const user_id = req.user._id
    const { id } = req.params
    try {
        const user = await User.findById({ _id: user_id })
        const product = await Product.findById({ _id: id })
        if (!product) {
            return res.status(404).json({
                sucess: false,
                message: "Product not found"
            })
        }
        const users = product.add_cart

        await Product.deleteOne({ _id: id })
        // await user.updateOne({ $pull: { "products": id } })

        //removing products from all users cart
        await User.updateMany(
            {},
            { $pull: { cart: { prod_id: id } } }
        )
        // for (let i = 0; i < users.length; i++) {
        //     const cart_user = await User.findById({ _id: users[i] })
        //     await cart_user.updateOne({ $pull: { "cart": id } })
        // }

        res.status(200).json(id)
    }
    catch (error) {
        res.status(400).json({ error })
    }
}

const addCart = async (req, res) => {
    const { id } = req.params
    const user_id = req.user._id
    const qty = req.body.qty
    let obj = {
        prod_id: id,
        qty
    }
    try {
        const user = await User.findById({ _id: user_id })
        const product = await Product.findById({ _id: id })
        if (!product) {
            return res.status(404).json({
                sucess: false,
                review: "Product not found"
            })
        }
        if (!product.add_cart.includes(user_id)) {
            await product.updateOne({ $push: { "add_cart": user_id } })
        }
        for (let i = 0; i < user.cart.length; i++) {
            if (user.cart[i].prod_id === id) {
                await User.updateOne(
                    { _id: user_id, "cart.prod_id": id },
                    { $set: { "cart.$.qty": qty } }
                )
                return res.status(200).json(user)
            }
        }
        await user.updateOne({ $push: { "cart": obj } })
        return res.status(200).json(user)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const removeCart = async (req, res) => {
    const { id } = req.params
    const user_id = req.user._id
    try {
        const user = await User.findById({ _id: user_id })
        const product = await Product.findById({ _id: id })
        if (!product) {
            return res.status(404).json({
                sucess: false,
                message: "Product not found"
            })
        }
        await product.updateOne({ $pull: { "add_cart": user_id } })
        await user.updateOne(
            { $pull: { cart: { prod_id: id } } }
        )
        return res.status(200).json(user)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const fetchCart = async (req, res) => {
    const user_id = req.user._id
    let cart = []
    try {
        const user = await User.findById({ _id: user_id })
        for (let i = 0; i < user.cart.length; i++) {
            let productId = user.cart[i].prod_id
            let qty = user.cart[i].qty
            const product = await Product.findById({ _id: productId })
            cart.push({ ...product._doc, qty })
        }

        res.status(200).json(cart)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const emptyCart = async (req, res) => {
    const { id } = req.params
    const products = req.body.products
    try {
        if (id !== "null") {
            const user = await User.findById({ _id: id })
            const cart = user.cart
            await user.updateOne(
                { $set: { cart: [] } }
            )

            for (let i = 0; i < cart.length; i++) {
                let product = await Product.findById({ _id: cart[0].prod_id })
                let stock = product.stock - cart[0].qty
                console.log(stock)
                await product.updateOne({ $pull: { "add_cart": id } })
                await product.updateOne({ $set: { "stock": stock } })
            }

            return res.status(200).json({
                message: "updated",
                cart
            })
        }

        else {
            for (let i = 0; i < products.length; i++) {
                let product = await Product.findById({ _id: products[0]._id })
                let stock = products[0].stock - products[0].qty
                await product.updateOne({ $set: { "stock": stock } })
            }
            return res.status(200).json({
                message: "updated"
            })
        }


    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const filterProduct = async (req, res) => {
    try {
        const page = parseInt(req.query.page) - 1 || 0;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || "";
        let sort = req.query.sort || "price";
        let brand = req.query.brand || "All";
        let gender = req.query.gender || "All";
        let sizes = req.query.sizes || "All";

        const sizesOptions = [
            "S", "M", "L", "ML", "XL"
        ]

        const genderOptions = [
            "Men", "Women", "Unisex"
        ]

        const brandOptions = [
            "Nike",
            "Adidas",
            "Puma",
            "Reebok",
            "Sparks",
            "Bata"
        ]

        brand === "All"
            ? (brand = [...brandOptions])
            : (brand = req.query.brand.split(","));

        gender === "All"
            ? (gender = [...genderOptions])
            : (gender = req.query.gender.split(","));

        sizes === "All"
            ? (sizes = [...sizesOptions])
            : (sizes = req.query.sizes.split(","));

        req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

        let sortBy = {};
        if (sort[1]) {
            sortBy[sort[0]] = sort[1];
        } else {
            sortBy[sort[0]] = "asc";
        }

        let products = Product.find({
            name: {
                $regex: search,
                $options: "i"
            }
        })
            .where("brand")
            .in([...brand])
            // .where("category")
            // .in([...category])
            .where("gender")
            .in([...gender])
            .where("sizes")
            .in([...sizes])
            .sort(sortBy)
            .skip(page * limit)
            .limit(limit)

        // if (req.query.stock == 0) {
        //     products = products.where('stock').equals(0)
        // }

        products = await products

        const total = await Product.countDocuments({
            sizes: { $in: [...sizes] },
            gender: { $in: [...gender] },
            sizes: { $in: [...sizes] },
            brand: { $in: [...brand] },
            // category: { $in: [...category] },
            name: { $regex: search, $options: "i" },
        });

        res.status(200).json({
            error: false,
            total,
            page: page + 1,
            limit,
            genders: genderOptions,
            sizes: sizesOptions,
            products,
        })
    }

    // try {

    //     //range query
    //     const queryObj = { ...req.query }
    //     const excludedFields = ['page', 'sort', 'limit', 'fields'];
    //     excludedFields.forEach(el => delete queryObj[el]);

    //     let queryStr = JSON.stringify(queryObj);
    //     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    //     let query = Product.find(JSON.parse(queryStr))

    //     //Sorting Method
    //     if (req.query.sort) {
    //         query = query.sort(req.query.sort)
    //     }
    //     const products = await query

    //     res.status(200).json({
    //         products
    //     })

    // }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const addReview = async (req, res) => {
    const user_id = req.user._id
    //product id
    const { id } = req.params
    try {
        var user = await User.findById({ _id: user_id })
        var product = await Product.findById({ _id: id })

        var obj = {
            text: req.body.text,
            user_id,
            user_name: user.name,
            avatar: user.avatar,
            updatedAt: new Date()
        }

        await product.updateOne({ $push: { "reviews": obj } })

        product = await Product.findById({ _id: id })

        res.status(200).json(product)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const deleteReview = async (req, res) => {
    const user_id = req.user._id
    const { id } = req.params
    var review = req.body.review
    try {
        var user = await User.findById({ _id: user_id })
        var product = await Product.findById({ _id: id })

        await Product.updateMany(
            {},
            { $pull: { reviews: { _id: review._id } } }
        )

        product = await Product.findById({ _id: id })
        res.status(200).json(product)
    }
    catch (error) {
        res.status(400).json({ error: error.review })
    }
}

module.exports = {
    getProduct,
    singleProduct,
    createProduct,
    deleteProduct,
    addCart,
    removeCart,
    emptyCart,
    fetchCart,
    filterProduct,
    addReview,
    deleteReview,
}