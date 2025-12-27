import pool from '../db.js';
import Midtrans from 'midtrans-client';
import axios from 'axios';

/**
 * TODO:
 * Implementasi detail transaksi dari frontend dan juga gateway untuk backend
 */

let snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MT_SERVER_KEY,
    clientKey: process.env.MT_CLIENT_KEY
});

let core = new Midtrans.CoreApi({
    isProduction: false,
    serverKey: process.env.MT_SERVER_KEY,
    clientKey: process.env.MT_CLIENT_KEY
});

const getPayment = async (req, res) => {
    const paymentId = req.params.id;

    try {
        if (paymentId) {
            const data = await pool.query('SELECT * FROM payments WHERE id = $1', [paymentId]);
            if (data.rowCount <= 0) {
                return res.status(404).json({ message: 'Data tidak ditemukan' });
            }
            return res.status(200).json({ data: data.rows[0] });
        }
        const data = await pool.query('SELECT * FROM payments');
        return res.status(200).json({ data: data.rows[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

const getMidtransTransactionDetail = async (req, res) => {
    const { orderId } = req.params;
    if (!orderId) return res.status(400).json({ message: 'orderId wajib diisi' });
    const url = `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`;

    try {
        const midtrans = await axios.get(url, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.MT_SERVER_KEY}:`).toString('base64')}`,
                Accept: 'application/json',
            },
        });
        return res.status(200).json(midtrans.data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Gagal mengambil detail transaksi dari Midtrans.',
            error: error?.message,
        });
    }
};

const createPayment = async (req, res) => {
    const {
        user_id,
        full_name,
        email,
        phone,
        room_type,
        room_number,
        product_name,
        capacity,
        price,
        quantity
    } = req.body;

    let parameter = {
        transaction_details: {
            order_id: `${user_id}_${room_number}`,
            gross_amount: price * quantity
        },
        item_details: {
            name: product_name,
            no_kamar: room_number,
            tipe: room_type,
            kapasitas: capacity,
            price,
            quantity: quantity
        },
        customer_details: {
            full_name: full_name,
            email,
            phone,
        }
    };



    try {
        const { token, redirect_url } = await snap.createTransaction(parameter);
        console.log(token.token);
        res.status(200).json({ message: 'Payment has been created.', token, url: redirect_url, orderId: parameter.transaction_details.order_id });
    } catch (error) {

    }

};

export {
    getPayment,
    getMidtransTransactionDetail,
    createPayment
}