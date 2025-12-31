import pool from '../db.js';
import Midtrans from 'midtrans-client';
import axios from 'axios';
import crypto from 'crypto';

// ====================================
// PAYMENT QUERY HANDLERS
// ====================================
// File ini berisi handler untuk pembayaran booking kamar
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
 * - Digunakan oleh createPayment untuk generate payment token
 * - Validasi payload dan hitung total amount
 * - Mendukung total_amount langsung atau perhitungan dari price × quantity
 * 
 * @param {Object} paymentData - Data pembayaran dari request body
 * @returns {Object} Token, URL redirect, orderId, amount, dan userId
 * @throws {Error} Jika payload tidak lengkap atau price/quantity tidak valid
 */
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
        quantity,
        total_amount  // Total harga yang sudah dihitung di frontend
    } = paymentData;

    // Konversi ke number dengan default value
    const qty = Number(quantity ?? 1);
    const unitPrice = Number(price ?? 0);

    // Validasi: pastikan field wajib terisi
    if (!user_id || !room_number || !product_name || !email || !phone) {
        throw new Error('Payload tidak lengkap.');
    }

    // Validasi: pastikan price dan quantity adalah angka valid
    if (!Number.isFinite(qty) || !Number.isFinite(unitPrice) || qty <= 0 || unitPrice <= 0) {
        throw new Error('price/quantity tidak valid.');
    }

    // Generate unique order ID dengan format: userId_randomString
    const orderId = `${user_id}_${crypto.randomUUID().slice(0, 8)}`;

    // Gunakan total_amount jika disediakan, jika tidak hitung dari price × quantity
    const amount = total_amount ? Number(total_amount) : (unitPrice * qty);

    // Parameter untuk Midtrans Snap API
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
        // Custom fields untuk menyimpan data tambahan
        custom_field1: room_type,
        custom_field2: String(capacity ?? ''),
        custom_field3: String(room_number),
    };

    // Buat transaksi ke Midtrans
    const trx = await snap.createTransaction(parameter);

    return {
        token: trx?.token,
        url: trx?.redirect_url,
        orderId,
        amount,
        userId: user_id  // Kembalikan userId untuk digunakan nanti
    };
};

/**
 * Membuat payment baru untuk booking kamar
 * - Membuat transaksi Midtrans
 * - Menyimpan data payment ke database
 * - Mengembalikan token untuk Snap popup
 * 
 * @param {Express.Request} req - Object request dengan body berisi data payment
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi token, URL, dan orderId
 */
const createPayment = async (req, res) => {
    try {
        // 1. Buat transaksi Midtrans (tidak kirim response)
        const midtransResult = await createMidtransTransaction(req.body);

        // 2. Simpan ke database
        await pool.query('BEGIN');

        // Cari booking terbaru dari user ini
        const getBookingId = await pool.query(
            'SELECT id, user_id FROM bookings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [midtransResult.userId]
        );

        if (getBookingId.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'User tidak ditemukan melakukan transaksi.' });
        }

        const bookingId = getBookingId.rows[0].id;

        // Insert data payment ke database dengan status pending
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

        // Handle error spesifik Midtrans (order_id duplikat)
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

/**
 * Mengambil data payment dari database
 * - Jika id disediakan di params, ambil satu payment spesifik
 * - Jika tidak, ambil semua payments
 * 
 * @param {Express.Request} req - Object request dengan params: id (opsional)
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi data payment
 */
const getPayment = async (req, res) => {
    const paymentId = req.params.id;

    try {
        // Jika id ada di params, cari payment spesifik
        if (paymentId) {
            const data = await pool.query('SELECT * FROM payments WHERE id = $1', [paymentId]);
            if (data.rowCount <= 0) {
                return res.status(404).json({ message: 'Data tidak ditemukan' });
            }
            return res.status(200).json({ data: data.rows[0] });
        }

        // Jika tidak ada params, ambil semua payments
        const data = await pool.query('SELECT * FROM payments');
        return res.status(200).json({ data: data.rows[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
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
 * Handler callback dari Midtrans setelah pembayaran
 * - Dipanggil oleh frontend setelah user selesai di Snap popup
 * - Menghandle berbagai status: success, pending, error, close
 * - Update status payment dan booking di database
 * 
 * @param {Express.Request} req - Object request dengan body: { event, payload, orderId }
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi status callback
 */
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

                // 3. Update data payment dengan info dari Midtrans
                const updateResult = await pool.query(`
                    UPDATE payments SET
                        method = $1,
                        status = $2,
                        midtrans_transaction_id = $3,
                        midtrans_status = $4
                    WHERE booking_id = $5
                    RETURNING *
                `, [
                    payload?.payment_type || 'unknown',          // method (qris, bank_transfer, dll)
                    'paid',                                       // status internal
                    payload?.transaction_id || null,              // midtrans_transaction_id
                    payload?.transaction_status || 'settlement',  // midtrans_status
                    bookingId
                ]);

                // 4. Update status booking menjadi dikonfirmasi
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

                // Update status payment menjadi pending
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

                // Update status payment menjadi failed
                await pool.query(`
                    UPDATE payments SET
                        status = $1,
                        midtrans_status = $2
                    WHERE booking_id = $3
                `, ['failed', payload?.transaction_status || 'deny', bookingId]);

                // Update booking status jadi dibatalkan
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