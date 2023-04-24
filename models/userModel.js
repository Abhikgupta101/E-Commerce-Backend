const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
    },
    role: {
        type: String,
        default: "user",
    },
    products: [{
        type: String
    }],
    cart: [
        {
            prod_id: { type: String },
            qty: { type: Number }
        }
    ]
}, { timestamps: true })

//static signup method or Creating a user account

userSchema.statics.signup = async function (email, password, name) {

    //validation
    if (!email || !password) {
        throw Error('All fields must be filled')
    }

    if (!validator.isEmail(email)) {
        throw Error('Email is not valid')
    }

    if (!validator.isStrongPassword(password)) {
        throw Error('Password not strong enough')
    }

    const exist = await this.findOne({ email })

    if (exist) {
        throw Error('Email in use')
    }

    //hashing the password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({
        email,
        password: hash,
        name,
    })

    return user
}

//static login method or Creating a user account

userSchema.statics.login = async function (email, password) {

    //validation
    if (!email || !password) {
        throw Error('All fields must be filled')
    }

    const user = await this.findOne({ email })

    if (!user) {
        throw Error('Incorrect Email')
    }

    //hashing the password
    const match = await bcrypt.compare(password, user.password)

    if (!match) {
        throw Error('Invalid Login Credentials')
    }

    return user
}

module.exports = mongoose.model('User', userSchema)