// Abc_123$ ---- password
const User = require('../models/userModel')
const Post = require('../models/productModel')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const nodemailer = require("nodemailer");


const keysecret = process.env.SECRET

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})


const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' })
}
//create user or signin
const createUser = async (req, res) => {

    try {
        const { token } = req.cookies

        if (token) {
            return res.status(401).json({ error: 'User Already Signed In' })
        }

        const user = await User.signup(req.body.email, req.body.password, req.body.name)
        //delete a token
        const authId = createToken(user._id)
        res.status(200).cookie("token", authId).json({
            success: true,
            user,
            authId
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getUser = async (req, res) => {
    const { id } = req.params
    try {
        const user = await User.findById({ _id: id })
        return res.status(200).json(user)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

//get all Users

const getUsers = async (req, res) => {

    try {
        const users = await User.find().sort({ createdAt: -1 })
        res.status(200).json(users)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}


//login
const accountLogin = async (req, res) => {

    try {
        const { token } = req.cookies

        if (token) {
            return res.status(401).json({ error: 'User Already Logged In' })
        }
        const user = await User.login(req.body.email, req.body.password)
        //create a token
        const authId = createToken(user._id)
        res.status(200).cookie("token", authId).json({
            success: true,
            user,
            message: 'Logged In',
            authId
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

//logout user
const logout = async (req, res) => {

    try {
        res.status(200).cookie("token", null, { expires: new Date(Date.now()), httpOnly: true }).json({
            success: true,
            message: 'Logged Out'
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// send email Link For reset Password
const sendEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(401).json({ status: 401, message: "Enter Your Email" })
    }

    try {
        const user = await User.findOne({ email: email });

        const token = createToken(user._id)

        if (token) {
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: "Sending Email For password Reset",
                text: `http://localhost:3000/password/reset/${user._id}/${token}`
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("error", error);
                    res.status(401).json({ status: 401, message: "Email not sent" })
                } else {
                    console.log("Email sent", info.response);
                    res.status(201).json({ status: 201, message: "Email sent Successfully" })
                }
            })

        }

    } catch (error) {
        res.status(401).json({ status: 401, message: "invalid user" })
    }

};

const changePassword = async (req, res) => {
    // console.log(req.body.password)
    // console.log(req.body.id)
    // console.log(req.body.token)

    try {
        // if (!req.body.token) {
        //     return res.status(401).json({ error: 'Password Update Timeout' })
        // }
        if (!validator.isStrongPassword(req.body.password)) {
            return res.status(401).json({ error: 'Password not Strong Enough' })
        }
        const user = await User.findById({ _id: req.body.id })

        // hashing the password
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.password, salt)

        await user.updateOne({ $set: { "password": hash } })

        res.status(200).json({
            user_id: req.body.id,
            id: req.body.password,
            message: 'Password Changed Successfully'
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }

}



//Delete User
// const deleteUser = async (req, res) => {
//     const user_id = req.user._id
//     try {
//         const user = await User.findById({ _id: user_id })
//         const posts = user.posts
//         const followers = user.followers
//         const following = user.following

//         //deleting user
//         await User.deleteOne({ _id: user_id })

//         //logout user
//         res.status(200).cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });

//         //deleting user posts
//         for (let i = 0; i < posts.length; i++) {
//             const id = posts[i];
//             await Post.deleteOne({ _id: id })
//         }

//         //remove followers
//         for (let i = 0; i < followers.length; i++) {
//             const id = followers[i]
//             const followuser = await User.findById({ _id: id })
//             await followuser.updateOne({ $pull: { "following": user_id } })

//         }

//         //remove following
//         for (let i = 0; i < following.length; i++) {
//             const id = following[i]
//             const followinguser = await User.findById({ _id: id })
//             await followinguser.updateOne({ $pull: { "followers": user_id } })

//         }


//         return res.status(200).json(user)
//     }
//     catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

// //follow user
// const followUnfollow = async (req, res) => {
//     const { id } = req.params
//     const user_id = req.user._id
//     try {
//         let user = await User.findById({ _id: id })
//         let current_user = await User.findById({ _id: user_id })
//         if (!user) {
//             return res.status(404).json({
//                 sucess: false,
//                 message: "User not found"
//             })
//         }

//         if (user.followers.includes(user_id)) {
//             user = await user.updateOne({ $pull: { "followers": user_id } })
//             current_user = await current_user.updateOne({ $pull: { "following": id } })
//             console.log(user)
//             return res.status(200).json(user)
//         }

//         else {
//             user = await user.updateOne({ $push: { "followers": user_id } })
//             current_user = await current_user.updateOne({ $push: { "following": id } })
//             console.log(user)
//             return res.status(200).json(user)
//         }
//     }
//     catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

// const removeFollower = async (res, req) => {
//     const { id } = req.params
//     const user_id = req.user._id
//     try {
//         let user = await User.findById({ _id: id })
//         let current_user = await User.findById({ _id: user_id })
//         if (!user) {
//             return res.status(404).json({
//                 sucess: false,
//                 message: "User not found"
//             })
//         }

//         if (current_user.followers.includes(id)) {
//             current_user = await current_user.updateOne({ $pull: { "followers": id } })
//             user = await user.updateOne({ $pull: { "following": user_id } })
//             console.log(user)
//             return res.status(200).json(user)
//         }
//     }
//     catch (error) {
//         res.status(400).json({ error: error.message })
//     }

// }

module.exports = {
    createUser,
    getUser,
    getUsers,
    accountLogin,
    logout,
    sendEmail,
    changePassword

    // deleteUser,
    // followUnfollow,
    // removeFollower

}