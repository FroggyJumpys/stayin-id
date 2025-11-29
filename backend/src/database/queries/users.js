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
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

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
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
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
    const { target_email, full_name, email, password, phone } = req.body;

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
            'UPDATE users SET full_name = $1, email = $2, password_hash = $3, phone = $4, updated_at = $5 WHERE email = $6 RETURNING *',
            [full_name, email, hashPassword, phone, updatedAt, target_email]
        );

        await pool.query('COMMIT');

        return res.status(200).json({
            message: `Pengguna dengan email sebelumnya ${target_email} telah diperbarui.`,
            data: data.rows[0]
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

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
    const email = req.body.email;

    // Validasi: pastikan email tersedia
    if (!email) return res.status(400).json({ message: 'Field data kosong.' });

    try {
        await pool.query('BEGIN');

        // Cek apakah user dengan email tersebut ada
        const isExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (isExist.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Pengguna tidak ada.' });
        }

        // Hapus user dari database
        await pool.query('DELETE FROM users WHERE email = $1', [email]);

        await pool.query('COMMIT');

        res.status(200).json({ message: `Pengguna dengan email ${email} telah dihapus.` });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
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
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
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
        return res.status(500).json({ message: 'Kesalahan server internal.' }); // Fixed typo: stauts -> status
    }
}

export {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    logoutUser
};