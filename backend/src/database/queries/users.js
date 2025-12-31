import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import pool from "../db.js";

// ====================================
// USER QUERY HANDLERS
// ====================================

/**
 * Mengambil data user dari database
 * - Jika email disediakan di params, ambil satu user spesifik
 * - Jika tidak, ambil semua user
 * 
 * @param {Express.Request} req - Object request dari Express
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi data user atau error message
 */
const getUsers = async (req, res) => {
    const params = req.params.email;

    try {
        // Jika email ada di params, cari user berdasarkan email
        if (params) {
            const data = await pool.query('SELECT * FROM users WHERE email = $1', [params]);
            if (data.rowCount <= 0) return res.status(404).json({ message: `Pengguna dengan email ${params} tidak ditemukan.` });
            return res.status(200).json(data.rows[0]);
        }

        // Jika tidak ada params, ambil semua user
        const data = await pool.query('SELECT * FROM users');
        return res.json(data.rows);
    } catch (error) {
        return res.status(500).json({ message: 'Kesalahan server internal.', err: error });
    }
};

const getRecentUser = async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        return res.status(200).json({
            data: data.rows[0]
        });
    } catch (error) {
        return res.status(500).json({ message: 'Kesalahan server internal.', err: error });
    };
};

/**
 * Mengambil data lengkap user beserta statistik
 * - Data user dasar (tanpa password)
 * - Total bookings dan total payments (hanya yang dikonfirmasi)
 * - Total service orders dan total amount (hanya yang selesai)
 * - Semua reviews user
 * 
 * @param {Express.Request} req - Object request dengan params: user_id
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi data lengkap user dan statistik
 */
const getUserData = async (req, res) => {
    const userId = req.params.user_id;

    // Validasi: pastikan user_id tersedia
    if (!userId) {
        return res.status(400).json({ message: 'User ID tidak boleh kosong.' });
    }

    try {
        // Query 1: Data user dasar (tanpa password_hash)
        const userQuery = await pool.query(
            'SELECT id, full_name, email, phone, role, created_at, updated_at FROM users WHERE id = $1',
            [userId]
        );

        if (userQuery.rowCount <= 0) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        // Query 2: Summary bookings & payments (hanya status 'dikonfirmasi' atau 'selesai')
        const paymentSummary = await pool.query(`
            SELECT 
                COUNT(DISTINCT b.id) AS total_bookings,
                COALESCE(SUM(p.amount), 0) AS total_payment
            FROM bookings b
            LEFT JOIN payments p ON p.booking_id = b.id
            WHERE b.user_id = $1
            AND b.status IN ('dikonfirmasi')
        `, [userId]);

        // Query 3: Summary service orders (hanya status 'dikonfirmasi')
        const orderSummary = await pool.query(`
            SELECT 
                COUNT(so.id) AS total_orders,
                COALESCE(SUM(so.total_amount), 0) AS total_order_amount
            FROM service_orders so
            INNER JOIN bookings b ON so.booking_id = b.id
            WHERE b.user_id = $1
            AND so.status = 'dikonfirmasi'
        `, [userId]);

        // Query 4: Semua reviews user
        const reviewsQuery = await pool.query(`
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at,
                r.updated_at
            FROM reviews r
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
        `, [userId]);

        // Hitung rata-rata rating
        const avgRating = reviewsQuery.rows.length > 0
            ? (reviewsQuery.rows.reduce((sum, r) => sum + r.rating, 0) / reviewsQuery.rows.length).toFixed(2)
            : 0;

        // Response dengan struktur yang rapi
        return res.status(200).json({
            user: userQuery.rows[0],
            summary: {
                total_bookings: parseInt(paymentSummary.rows[0].total_bookings) || 0,
                total_payment: parseInt(paymentSummary.rows[0].total_payment) || 0,
                total_orders: parseInt(orderSummary.rows[0].total_orders) || 0,
                total_order_amount: parseInt(orderSummary.rows[0].total_order_amount) || 0,
                total_reviews: reviewsQuery.rows.length,
                avg_rating: parseFloat(avgRating)
            },
            reviews: reviewsQuery.rows
        });

    } catch (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ message: 'Kesalahan server internal.', err: error });
    }
}

const getGrowth = async (req, res) => {
    try {
        const query = `
            WITH this_month AS (
                SELECT COUNT(*) AS total 
                FROM users
                WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
            ),
            last_month AS (
                SELECT COUNT(*) AS total 
                FROM users
                WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
                AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
            )
            SELECT 
                this_month.total AS total_this_month,
                last_month.total AS total_last_month,
                ROUND(
                (this_month.total - last_month.total)::decimal / NULLIF(last_month.total,0) * 100, 
                2
                ) AS growth_percentage
            FROM this_month, last_month;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows[0]);
    } catch (error) {

    }
}

/**
 * Membuat user baru di database
 * - Validasi field yang wajib diisi
 * - Cek duplikasi email sebelum insert
 * - Hash password menggunakan bcrypt dengan salt rounds 10
 * - Generate UUID untuk primary key
 * 
 * @param {Express.Request} req - Object request dengan body: { full_name, email, password, phone }
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi status dan data user baru (tanpa password)
 */
const createUser = async (req, res) => {
    const { full_name, email, password, phone } = req.body;

    // Validasi input: pastikan semua field terisi
    if (!full_name || !email || !password || !phone)
        return res.status(400).json({ message: 'Field data kosong.' });

    try {
        // Mulai transaction untuk atomic operation
        await pool.query('BEGIN');

        // Cek apakah email sudah terdaftar (mencegah duplikasi)
        const isExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (isExist.rowCount > 0) {
            await pool.query('ROLLBACK');
            return res.status(409).json({ message: 'Pengguna sudah ada.' });
        }

        // Generate UUID untuk primary key dan hash password
        const userId = crypto.randomUUID();
        const hashPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

        // Insert user baru ke database
        const data = await pool.query(
            'INSERT INTO users (id, full_name, email, password_hash, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, full_name, email, hashPassword, phone]
        );

        // Commit transaction jika sukses
        await pool.query('COMMIT');

        res.status(201).json({
            message: `Pengguna dengan email ${email} berhasil dibuat.`,
            data: data.rows[0]
        });
    } catch (error) {
        // Rollback jika terjadi error
        await pool.query('ROLLBACK');
        return res.status(500).json({ message: 'Kesalahan server internal.', err: error });
    }
}

/**
 * Update data user yang sudah ada
 * - Menggunakan target_email untuk mencari user yang akan diupdate
 * - Bisa mengganti email user (jika berbeda dengan target_email)
 * - Password otomatis di-hash ulang
 * - Timestamp updated_at diupdate otomatis
 * 
 * @param {Express.Request} req - Object request dengan body: { target_email, full_name, email, password, phone }
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi status dan data user yang sudah diupdate
 */
const updateUser = async (req, res) => {
    const { target_email, full_name, email, password, phone, role } = req.body;

    // Validasi: pastikan semua field terisi
    if (!target_email || !email || !full_name || !password || !phone)
        return res.status(400).json({ message: 'Field data kosong.' });

    try {
        await pool.query('BEGIN');

        // Cek apakah user dengan email target ada
        const isExist = await pool.query('SELECT * FROM users WHERE email = $1', [target_email]);
        if (isExist.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Pengguna tidak ada.' });
        }

        // Generate timestamp untuk updated_at dan hash password baru
        const updatedAt = new Date();
        const hashPassword = await bcrypt.hash(password, 10);

        // Update semua field user
        const data = await pool.query(
            'UPDATE users SET full_name = $1, email = $2, password_hash = $3, phone = $4, updated_at = $5, role = $6 WHERE email = $7 RETURNING *',
            [full_name, email, hashPassword, phone, updatedAt, role, target_email]
        );

        await pool.query('COMMIT');

        return res.status(200).json({
            message: `Pengguna dengan email sebelumnya ${target_email} telah diperbarui.`,
            data: data.rows[0]
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        return res.status(500).json({ message: 'Kesalahan server internal.', err: error });
    };
};

const changePassword = async (req, res) => {
    const { email, old_password, new_password } = req.body;

    if (!email || !old_password || !new_password)
        return res.status(400).json({ message: 'Field data kosong.' });

    try {
        await pool.query('BEGIN');

        const users = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (users.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: `Pengguna dengan email ${email} tidak ada.` });
        };

        const updatedAt = new Date();
        const checkPass = await bcrypt.compare(old_password, users.rows[0].password_hash);
        if (!checkPass) {
            await pool.query('ROLLBACK');
            return res.status(403).json({ message: 'Password salah.' });
        };

        const hashNewPass = await bcrypt.hash(new_password, 10);
        await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = $2 WHERE email = $3',
            [hashNewPass, updatedAt, email]
        );
        await pool.query('COMMIT');

        return res.status(200).json({ message: `${email} password telah diperbarui.` });
    } catch (error) {
        await pool.query('ROLLBACK');
        return res.status(500).json({ message: 'Kesalahan server internal.', err: error });
    }

}

/**
 * Menghapus user dari database berdasarkan email
 * - Cek keberadaan user sebelum delete
 * - Menggunakan transaction untuk keamanan
 * 
 * @param {Express.Request} req - Object request dengan body: { email }
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi status penghapusan
 */
const deleteUser = async (req, res) => {
    const { email } = req.body;

    // Validasi: pastikan email tersedia
    if (!email) {
        console.error('Delete user error: email is missing from request body');
        return res.status(400).json({ message: 'Email tidak boleh kosong.' });
    }

    try {
        await pool.query('BEGIN');

        // Cek apakah user dengan email tersebut ada
        const isExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (isExist.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: `Pengguna dengan email ${email} tidak ditemukan.` });
        }

        // Hapus user dari database
        await pool.query('DELETE FROM users WHERE email = $1', [email]);

        await pool.query('COMMIT');

        return res.status(200).json({ message: `Pengguna dengan email ${email} telah dihapus.` });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Delete user error:', error);
        return res.status(500).json({ message: 'Kesalahan server internal.', error: error.message });
    }
}

/**
 * Autentikasi user dan generate JWT token
 * - Cek keberadaan user berdasarkan email
 * - Verifikasi password menggunakan bcrypt.compare
 * - Generate JWT token dengan payload: id, email, role
 * - Set token di httpOnly cookie untuk keamanan (tidak bisa diakses via JavaScript)
 * - Token berlaku 10 hari
 * 
 * @param {Express.Request} req - Object request dengan body: { email, password }
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi status login dan set cookie token
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Validasi: pastikan email dan password tersedia
    if (!email || !password) return res.status(400).json({ message: 'Field data kosong.' });

    try {
        // Cari user berdasarkan email
        const users = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (users.rowCount <= 0) return res.status(404).json({ message: 'Pengguna tidak ada.' });

        const id = users.rows[0].id;
        const role = users.rows[0].role;
        const hashPassword = users.rows[0].password_hash;

        // Verifikasi password: bandingkan plain text dengan hash
        const verifyPass = await bcrypt.compare(password, hashPassword);
        if (!verifyPass) return res.status(401).json({ message: 'Kredensial tidak valid.' });

        // Generate JWT token dengan payload minimal (id, email, role)
        const data = { id, email, role };
        const token = jwt.sign(data, process.env.SECRET_KEY, {
            expiresIn: '10d' // Token berlaku 10 hari
        });

        // Set token di httpOnly cookie (tidak bisa diakses JavaScript, aman dari XSS)
        res.cookie('token', token, {
            httpOnly: true,           // Tidak bisa diakses via document.cookie
            secure: false,            // Set true di production (HTTPS only)
            maxAge: 10 * 24 * 60 * 60 * 1000, // 10 hari dalam milidetik
            sameSite: 'strict',       // CSRF protection
            path: '/'
        });

        return res.status(200).json({ message: 'Login berhasil.' });
    } catch (error) {
        return res.status(500).json({ message: 'Kesalahan server internal.', err: error });
    }
};

/**
 * Logout user dengan menghapus cookie token
 * - Menghapus httpOnly cookie 'token'
 * - Client harus redirect ke halaman login setelah logout
 * 
 * @param {Express.Request} req - Object request dari Express
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi status logout
 */
const logoutUser = async (req, res) => {
    try {
        // Hapus cookie token untuk logout
        res.clearCookie('token');
        return res.status(200).json({ message: 'Logout berhasil.' });
    } catch (error) {
        return res.status(500).json({ message: 'Kesalahan server internal.', err: error });
    }
}

export {
    getUsers,
    getRecentUser,
    getUserData,
    getGrowth,
    createUser,
    updateUser,
    changePassword,
    deleteUser,
    loginUser,
    logoutUser
};
