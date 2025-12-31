import pool from "../db.js";
import Midtrans from 'midtrans-client';
import axios from 'axios';
import crypto from 'crypto';

// ====================================
// SERVICE ORDERS QUERY HANDLERS
// ====================================
// File ini berisi handler untuk pemesanan layanan (service orders)
// termasuk integrasi dengan Midtrans payment gateway.

/**
 * Inisialisasi Midtrans Snap
 * - isProduction: false untuk mode sandbox/testing
 * - serverKey & clientKey diambil dari environment variables
 */
let snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MT_SERVER_KEY,
    clientKey: process.env.MT_CLIENT_KEY
});

/**
 * Helper function untuk membuat transaksi Midtrans
 * - Tidak mengirim response langsung, hanya return data
 * - Digunakan oleh createOrder untuk generate payment token
 * 
 * @param {Object} paymentData - Data pembayaran dari request body
 * @returns {Object} Token, URL redirect, orderId, dan info lainnya
 * @throws {Error} Jika payload tidak lengkap
 */
const createMidtransTransaction = async (paymentData) => {
    const {
        user_id,
        full_name,
        email,
        phone,
        service_category,
        service_id,
        service_name,
        price,
        quantity,
        total_amount,
        notes,
    } = paymentData;

    // Validasi: pastikan field wajib terisi
    if (!user_id || !service_category || !service_id || !email || !phone) {
        throw new Error('Payload tidak lengkap.');
    }

    // Generate unique order ID dengan format: userId_randomString
    const orderId = `${user_id}_${crypto.randomUUID().slice(0, 8)}`;

    // Pisahkan nama depan dan belakang untuk data customer
    const firstName = String(full_name || '').split();
    const lastName = String(full_name || '').split().slice(1);

    // Parameter untuk Midtrans Snap API
    const parameter = {
        transaction_details: {
            order_id: orderId,
            gross_amount: total_amount
        },
        item_details: [{
            id: String(service_id),
            name: service_name,
            price: price,
            quantity: quantity,
            category: service_category
        }],
        customer_details: {
            first_name: firstName[0],
            last_name: lastName.join(' '),
            email,
            phone
        },
        custom_field1: {
            notes
        }
    };

    // Buat transaksi ke Midtrans
    const trx = await snap.createTransaction(parameter);

    return {
        token: trx?.token,
        url: trx?.redirect_url,
        orderId,
        total_amount,
        userId: user_id
    };
};

/**
 * Mengambil detail transaksi dari Midtrans API
 * - Berguna untuk mengecek status pembayaran secara manual
 * 
 * @param {Express.Request} req - Object request dengan params: orderId
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi detail transaksi dari Midtrans
 */
const getMidtransTransactionDetail = async (req, res) => {
    const { orderId } = req.params;

    // Validasi: orderId wajib ada
    if (!orderId) return res.status(400).json({ message: 'orderId wajib diisi' });

    // URL Midtrans Sandbox API untuk cek status transaksi
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

/**
 * Mengambil data service orders dari database
 * - Jika id disediakan di params, ambil satu order spesifik
 * - Jika tidak, ambil semua orders
 * 
 * @param {Express.Request} req - Object request dengan params: id (opsional)
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi data order atau array orders
 */
const getOrders = async (req, res) => {
    const id = req.params.id;

    // Jika id ada di params, cari order spesifik
    if (id) {
        try {
            const result = await pool.query('SELECT * FROM service_orders WHERE id = $1', [id]);
            return res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching orders:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // Jika tidak ada params, ambil semua orders
    try {
        const result = await pool.query('SELECT * FROM service_orders');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * Membuat order layanan baru dan generate payment token
 * - Menerima data dari frontend (ServiceBuyModel)
 * - Membuat transaksi Midtrans untuk pembayaran
 * - Mengembalikan token untuk Snap popup
 * 
 * @param {Express.Request} req - Object request dengan body berisi data order
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi token, URL, dan orderId
 */
const createOrder = async (req, res) => {
    try {
        // Buat transaksi Midtrans
        const midtransResult = await createMidtransTransaction(req.body);
        const data = req.body;

        await pool.query('BEGIN');

        const getBookingId = await pool.query(`
            SELECT id FROM bookings 
            WHERE user_id = $1 AND status = $2
            ORDER BY id DESC LIMIT 1
        `, [data.user_id, 'dikonfirmasi']);

        if (getBookingId.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Tidak ada booking berkaitan dengan user.' });
        }

        const bookingId = getBookingId.rows[0].id;

        await pool.query(`
            INSERT INTO service_orders 
            (booking_id, service_id, quantity, total_amount, notes, midtrans_order_id)
            VALUES
            ($1, $2, $3, $4, $5, $6)
        `, [bookingId, data.service_id, data.quantity, data.total_amount, data.notes, midtransResult.orderId]);

        await pool.query('COMMIT');

        return res.status(201).json({
            message: 'Payment created',
            token: midtransResult.token,
            url: midtransResult.url,
            orderId: midtransResult.orderId,
        })
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

/**
 * Handler callback dari Midtrans setelah pembayaran
 * - Dipanggil oleh frontend setelah user selesai di Snap popup
 * - Menghandle berbagai status: success, pending, error, close
 * - Update status service_orders di database
 * 
 * @param {Express.Request} req - Object request dengan body: { event, payload, orderId }
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi status callback
 */
const callback = async (req, res) => {
    try {
        console.log('orders/callback payload:', req.body);

        const { event, payload, orderId } = req.body;

        // ===== PEMBAYARAN SUCCESS =====
        if (event === 'success') {
            await pool.query('BEGIN');

            try {
                // 1. Ambil userId dari orderId (format: "userId_randomId")
                const userId = orderId.split('_')[0];

                // 2. Cari booking berdasarkan user_id
                const getBookingResult = await pool.query(
                    'SELECT id FROM bookings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
                    [userId]
                );

                if (getBookingResult.rowCount <= 0) {
                    await pool.query('ROLLBACK');
                    return res.status(404).json({ message: 'Booking tidak ditemukan.' });
                }

                const bookingId = getBookingResult.rows[0].id;

                // 3. Update data service_order dengan info dari Midtrans
                const updateResult = await pool.query(`
                    UPDATE service_orders SET
                        status = $1,
                        midtrans_transaction_id = $2,
                        midtrans_status = $3
                    WHERE booking_id = $4 AND midtrans_order_id = $5
                    RETURNING *
                `, [
                    'dikonfirmasi',                               // status internal
                    payload?.transaction_id || null,              // midtrans_transaction_id
                    payload?.transaction_status || 'settlement',  // midtrans_status                                  // completed_at
                    bookingId,
                    orderId
                ]);

                // 4. COMMIT transaction
                await pool.query('COMMIT');

                console.log('Service order updated:', updateResult.rows[0]);
                return res.status(200).json({
                    message: 'Service order payment berhasil',
                    orderId,
                    transactionId: payload?.transaction_id,
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

                // Update status service_order menjadi pending
                await pool.query(`
                    UPDATE service_orders SET
                        status = $1,
                        midtrans_order_id = $2,
                        midtrans_status = $3
                    WHERE booking_id = $4
                `, ['pending', orderId, payload?.transaction_status || 'pending', bookingId]);
            }

            console.log('Service order payment pending:', orderId);
            return res.status(200).json({
                message: 'Service order payment pending',
                orderId
            });
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

                // Update status service_order menjadi dibatalkan
                await pool.query(`
                    UPDATE service_orders SET
                        status = $1,
                        midtrans_order_id = $2,
                        midtrans_status = $3
                    WHERE booking_id = $4
                `, ['dibatalkan', orderId, payload?.transaction_status || 'dibatalkan', bookingId]);
            }

            console.log('Service order payment failed:', orderId);
            return res.status(200).json({
                message: 'Service order payment failed',
                orderId
            });
        }

        // ===== USER CLOSE POPUP =====
        if (event === 'close') {
            console.log('User closed payment popup for service order:', orderId);
            // Tidak perlu update apapun, biarkan status tetap pending
            return res.status(200).json({ message: 'Payment popup closed' });
        }

        // Event tidak dikenal
        return res.status(200).json({ message: 'Event received', event });

    } catch (error) {
        console.error('orders/callback error:', error);
        return res.status(500).json({
            message: 'Gagal memproses callback',
            error: error?.message
        });
    }
};

/**
 * Mengambil semua service orders milik user tertentu
 * - Menggunakan user_id dari params
 * - Menampilkan dengan detail service yang dipesan
 * - Diurutkan berdasarkan ordered_at DESC
 * 
 * @param {Express.Request} req - Object request dengan params: user_id
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi array orders user atau error message
 */
const getUserOrders = async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ message: 'User ID diperlukan.' });
    }

    try {
        // Ambil semua orders user melalui booking dengan JOIN service untuk detail
        const data = await pool.query(`
            SELECT so.*, 
                s.name AS service_name, s.category, s.price AS service_price,
                b.check_in, b.check_out
            FROM service_orders so
            INNER JOIN bookings b ON so.booking_id = b.id
            INNER JOIN services s ON so.service_id = s.id
            WHERE b.user_id = $1
            ORDER BY so.ordered_at DESC
        `, [user_id]);

        // Hitung total amount keseluruhan
        const totalAmount = data.rows.reduce((sum, order) => sum + (parseInt(order.total_amount) || 0), 0);

        return res.status(200).json({ 
            data: data.rows,
            total_orders: data.rows.length,
            total_amount: totalAmount
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

/**
 * Update status service order (untuk staff)
 * - Validasi keberadaan order
 * - Status: pending, diproses, selesai, dibatalkan
 * 
 * @param {Express.Request} req - Object request dengan body: { id, status }
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi order yang sudah diupdate
 */
const updateOrderStatus = async (req, res) => {
    const { id, status } = req.body;

    // Validasi input
    if (!id || !status) {
        return res.status(400).json({ message: 'ID dan status order wajib diisi.' });
    }

    // Validasi status yang valid
    const validStatuses = ['pending', 'dikonfirmasi', 'dibatalkan'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Status tidak valid. Gunakan: ${validStatuses.join(', ')}` });
    }

    try {
        // Cek apakah order ada
        const isExist = await pool.query('SELECT * FROM service_orders WHERE id = $1', [id]);
        if (isExist.rowCount <= 0) {
            return res.status(404).json({ message: `Order dengan id ${id} tidak ditemukan.` });
        }

        // Update status order (dan completed_at jika selesai)
        let updated;
        if (status === 'dikonfirmasi') {
            updated = await pool.query(
                'UPDATE service_orders SET status = $1, completed_at = NOW() WHERE id = $2 RETURNING *',
                [status, id]
            );
        } else {
            updated = await pool.query(
                'UPDATE service_orders SET status = $1 WHERE id = $2 RETURNING *',
                [status, id]
            );
        }

        return res.status(200).json({
            message: `Status order ${id} berhasil diubah menjadi ${status}.`,
            data: updated.rows[0]
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

/**
 * Mengambil semua service orders dengan detail (untuk staff)
 * - Diurutkan berdasarkan ordered_at DESC
 * - Include detail service dan user
 * 
 * @param {Express.Request} req - Object request dari Express
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi array semua orders
 */
const getAllOrders = async (req, res) => {
    try {
        const data = await pool.query(`
            SELECT so.*, 
                s.name AS service_name, s.category, s.price AS service_price,
                b.check_in, b.check_out, b.user_id,
                u.full_name, u.email
            FROM service_orders so
            INNER JOIN bookings b ON so.booking_id = b.id
            INNER JOIN services s ON so.service_id = s.id
            INNER JOIN users u ON b.user_id = u.id
            ORDER BY so.ordered_at DESC
        `);

        return res.status(200).json({ data: data.rows });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

export { getMidtransTransactionDetail, getOrders, getUserOrders, getAllOrders, createOrder, updateOrderStatus, callback };