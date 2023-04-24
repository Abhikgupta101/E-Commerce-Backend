const stripe = require('stripe')(
    'sk_test_51MfSkCSAfImheSrYGSB7gciOLhCeOeaVV2OPGzcqIRzK38t25r3Kb6J1nnwNQYIN77vp7IY3XERODIUekVYUA2gv003Lb7v3W6'
)

const checkout = async (req, res) => {

    try {
        const total = req.body.amount;
        console.log("Payment Request recieved for this ruppess", total);

        const payment = await stripe.paymentIntents.create({
            amount: total * 100,
            currency: "inr",
        });

        res.status(201).send({
            clientSecret: payment.client_secret,
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}


module.exports = {
    checkout
}