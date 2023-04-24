require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const productRoutes = require('./routes/productRoutes')
const userRoutes = require('./routes/userRoutes')
const orderRoutes = require('./routes/orderRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const app = express()
const cors = require("cors");

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

//routes
app.use('/api/user', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/order', orderRoutes)

const PORT = process.env.PORT || 4000

const server = app.listen(PORT, () => {
    console.log('Listening on port', PORT)
})

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI)
    .then(() => { server })
    .catch((error) => {
        console.log(error)
    })
