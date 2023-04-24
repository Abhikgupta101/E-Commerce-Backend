const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const requireAuth = async (req, res, next) => {

    //verify authentication
    try {
        const { token } = req.cookies

        if (!token) {
            return res.status(401).json({ error: 'Authorization token required' })
        }

        const decoded = jwt.verify(token, process.env.SECRET)

        req.user = await User.findOne({ _id: decoded._id })

        next()
    }
    catch (error) {
        console.log(error)
        res.status(401).json({ error: 'Request is not authorized' })
    }

}

module.exports = requireAuth