import pool from '../db.js';
import Midtrans from 'midtrans-client';
import axios from 'axios';
import crypto from 'crypto';

let snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MT_SERVER_KEY,
    clientKey: process.env.MT_CLIENT_KEY
});

// Helper function - TIDAK kirim response, hanya return data
const createMidtransTransaction = async (paymentData) => {
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
    } = paymentData;

    const qty = Number(quantity ?? 1);
    const unitPrice = Number(price ?? 0);

    // Validasi
    if (!user_id || !room_number || !product_name || !email || !phone) {
        throw new Error('Payload tidak lengkap.');
    }
    if (!Number.isFinite(qty) || !Number.isFinite(unitPrice) || qty <= 0 || unitPrice <= 0) {
        throw new Error('price/quantity tidak valid.');
    }

    const orderId = `${user_id}_${crypto.randomUUID().slice(0, 8)}`;
    const amount = unitPrice * qty;

    const parameter = {
        transaction_details: {
            order_id: orderId,
            gross_amount: amount,
        },
        item_details: [
            {
                id: String(room_number),
                name: product_name,
                price: unitPrice,
                quantity: qty,
            }
        ],
        customer_details: {
            first_name: String(full_name || '').trim() || 'Customer',
            email,
            phone,
        },
        custom_field1: room_type,
        custom_field2: String(capacity ?? ''),
        custom_field3: String(room_number),
    };

    const trx = await snap.createTransaction(parameter);

    return {
        token: trx?.token,
        url: trx?.redirect_url,
        orderId,
        amount,
        userId: user_id  // Kembalikan userId untuk digunakan nanti
    };
};

const createPayment = async (req, res) => {
    try {
        // 1. Buat transaksi Midtrans (tidak kirim response)
        const midtransResult = await createMidtransTransaction(req.body);

        // 2. Simpan ke database
        await pool.query('BEGIN');

        const getBookingId = await pool.query(
            'SELECT id, user_id FROM bookings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [midtransResult.userId]  // ← Sekarang userId tersedia!
        );

        if (getBookingId.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'User tidak ditemukan melakukan transaksi.' });
        }

        const bookingId = getBookingId.rows[0].id;

        await pool.query(`
            INSERT INTO payments (booking_id, amount, method, midtrans_order_id, status)
            VALUES ($1, $2, $3, $4, $5)
        `, [bookingId, midtransResult.amount, 'waiting payment', midtransResult.orderId, 'pending']);

        await pool.query('COMMIT');

        // 3. Kirim response SEKALI saja
        return res.status(201).json({
            message: 'Payment created',
            token: midtransResult.token,
            url: midtransResult.url,
            orderId: midtransResult.orderId,
        });

    } catch (error) {
        await pool.query('ROLLBACK').catch(() => { });

        console.error('createPayment error:', error?.message || error);

        // Handle error spesifik Midtrans
        const apiMsg = error?.ApiResponse?.error_messages?.[0];
        if (apiMsg?.includes('order_id has already been taken')) {
            return res.status(409).json({
                message: 'Order ID sudah pernah dipakai. Silakan coba lagi.',
                error: apiMsg,
            });
        }

        return res.status(500).json({
            message: error?.message || 'Gagal membuat transaksi.',
            error: apiMsg || error?.message,
        });
    }
};

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

const callback = async (req, res) => {
    try {
        console.log('payments/callback payload:', req.body);

        const { event, payload, orderId } = req.body;

        // ===== PEMBAYARAN SUCCESS =====
        if (event === 'success') {
            await pool.query('BEGIN');

            try {
                // 1. Ambil userId dari orderId (format: "userId_randomId")
                const userId = orderId.split('_')[0];

                // 2. Cari booking berdasarkan user_id (TANPA tanda kurung!)
                const getBookingResult = await pool.query(
                    'SELECT id FROM bookings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
                    [userId]
                );

                if (getBookingResult.rowCount <= 0) {
                    await pool.query('ROLLBACK');
                    return res.status(404).json({ message: 'Booking tidak ditemukan.' });
                }

                const bookingId = getBookingResult.rows[0].id;

                // 3. Update data payment
                const updateResult = await pool.query(`
                    UPDATE payments SET
                        method = $1,
                        status = $2,
                        midtrans_transaction_id = $3,
                        midtrans_status = $4
                    WHERE booking_id = $5
                    RETURNING *
                `, [
                    payload?.payment_type || 'unknown',     // method (qris, bank_transfer, dll)
                    'paid',                                  // status internal
                    payload?.transaction_id || null,         // midtrans_transaction_id
                    payload?.transaction_status || 'settlement', // midtrans_status
                    bookingId
                ]);

                // 4. Update status booking juga (opsional)
                await pool.query(`
                    UPDATE bookings SET status = $1 WHERE id = $2
                `, ['dikonfirmasi', bookingId]);

                // 5. COMMIT transaction
                await pool.query('COMMIT');

                console.log('Payment updated:', updateResult.rows[0]);
                return res.status(200).json({
                    message: 'Payment berhasil diupdate',
                    data: updateResult.rows[0]
                });

            } catch (dbError) {
                await pool.query('ROLLBACK');
                throw dbError;
            }
        }

        // ===== PEMBAYARAN PENDING =====
        if (event === 'pending') {
            const userId = orderId.split('_')[0];

            const getBookingResult = await pool.query(
                'SELECT id FROM bookings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
                [userId]
            );

            if (getBookingResult.rowCount > 0) {
                const bookingId = getBookingResult.rows[0].id;

                await pool.query(`
                    UPDATE payments SET
                        status = $1,
                        midtrans_status = $2
                    WHERE booking_id = $3
                `, ['pending', payload?.transaction_status || 'pending', bookingId]);
            }

            return res.status(200).json({ message: 'Payment pending' });
        }

        // ===== PEMBAYARAN ERROR/GAGAL =====
        if (event === 'error') {
            const userId = orderId.split('_')[0];

            const getBookingResult = await pool.query(
                'SELECT id FROM bookings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
                [userId]
            );

            if (getBookingResult.rowCount > 0) {
                const bookingId = getBookingResult.rows[0].id;

                await pool.query(`
                    UPDATE payments SET
                        status = $1,
                        midtrans_status = $2
                    WHERE booking_id = $3
                `, ['failed', payload?.transaction_status || 'deny', bookingId]);

                // Update booking status jadi cancelled
                await pool.query(`
                    UPDATE bookings SET status = $1 WHERE id = $2
                `, ['dibatalkan', bookingId]);
            }

            return res.status(200).json({ message: 'Payment failed' });
        }

        // ===== USER CLOSE POPUP =====
        if (event === 'close') {
            console.log('User closed payment popup');
            // Tidak perlu update apapun, biarkan status tetap pending
            return res.status(200).json({ message: 'Payment popup closed' });
        }

        // Event tidak dikenal
        return res.status(200).json({ message: 'Event received' });

    } catch (error) {
        console.error('payments/callback error:', error);
        return res.status(500).json({
            message: 'Gagal memproses callback',
            error: error?.message
        });
    }
};

export {
    getPayment,
    getMidtransTransactionDetail,
    createPayment,
    callback
}