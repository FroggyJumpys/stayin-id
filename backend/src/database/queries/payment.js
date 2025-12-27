import Midtrans from 'midtrans-client';
import pool from '../db.js'

let snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MT_SERVER_KEY,
    clientKey: process.env.MT_CLIENT_KEY
});

const createPayment = async (req, res) => {
    const { id, product_name, price, quantity } = req.body;

    let parameter = {
        item_details: {
            name: product_name,
            price: price,
            quantity: quantity
        },
        transaction_details: {
            order_id: id,
            gross_amount: price * quantity
        }
    };

    const token = await snap.createTransaction(parameter);
    console.log(token.token);
    res.status(200).json({ token });
};

export {
    createPayment
}