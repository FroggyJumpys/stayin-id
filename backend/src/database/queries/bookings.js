import pool from '../db.js';

// ====================================
// BOOKING QUERY HANDLERS
// ====================================

/**
 * Mengambil data booking dari database
 * - Jika id disediakan di params, ambil satu booking spesifik dengan detail user & room
 * - Jika tidak, ambil semua booking dengan detail user & room
 * 
 * @param {Express.Request} req - Object request dari Express
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi data booking atau error message
 */
const getBookings = async (req, res) => {
    const bookingId = req.params.id;

    try {
        // Jika id ada di params, cari booking berdasarkan id dengan JOIN user & room
        if (bookingId) {
            const search = await pool.query(
                `SELECT b.*, 
                u.full_name, u.email, 
                r.room_number, r.room_type, r.price 
                FROM bookings b
                JOIN users u ON b.user_id = u.id
                JOIN rooms r ON b.room_id = r.id
                WHERE b.id = $1`,
                [bookingId]
            );

            if (search.rowCount <= 0) {
                return res.status(404).json({ message: `Booking dengan id ${bookingId} tidak ditemukan.` });
            }
            return res.status(200).json({ data: search.rows[0] });
        }

        // Jika tidak ada params, ambil semua booking dengan JOIN user & room
        const data = await pool.query(
            `SELECT b.*, 
            u.full_name, u.email, 
            r.room_number, r.room_type, r.price 
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN rooms r ON b.room_id = r.id
            ORDER BY b.created_at DESC`
        );
        return res.status(200).json({ data: data.rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

/**
 * Mengambil semua booking milik user tertentu
 * - Menggunakan user_id dari params
 * - Menampilkan dengan detail room yang di-booking
 * - Diurutkan berdasarkan created_at DESC
 * 
 * @param {Express.Request} req - Object request dari Express
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi array booking user atau error message
 */
const getUserBookings = async (req, res) => {
    const { user_id } = req.params;

    try {
        // Ambil semua booking user dengan JOIN room untuk detail kamar
        const data = await pool.query(
            `SELECT b.*, 
            r.room_number, r.room_type, r.price
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC`,
            [user_id]
        );

        return res.status(200).json({ data: data.rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

/**
 * Membuat booking baru untuk user
 * - Validasi keberadaan user dan room
 * - Menggunakan transaksi untuk memastikan data consistency
 * - Room diidentifikasi menggunakan room_number
 * 
 * @param {Express.Request} req - Object request dari Express
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi booking yang baru dibuat atau error message
 */
const createBooking = async (req, res) => {
    const { user_id, room_number, check_in, check_out } = req.body;

    // Validasi input field
    if (!user_id || !room_number || !check_in || !check_out) {
        return res.status(400).json({ message: 'Data field kosong.' });
    }

    try {
        // Mulai transaksi database
        await pool.query('BEGIN');

        // Cek apakah user dengan id tersebut ada
        const getUser = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
        if (getUser.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: `Pengguna dengan id ${user_id} tidak ditemukan atau invalid.` });
        }

        // Ambil id room menggunakan room_number
        const getRoom = await pool.query('SELECT id FROM rooms WHERE room_number = $1', [room_number]);
        if (getRoom.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: `Kamar dengan nomor ${room_number} tidak ditemukan atau invalid.` });
        }

        const userId = getUser.rows[0].id;
        const roomId = getRoom.rows[0].id;
        const checkIn = check_in || new Date();
        const checkOut = check_out || new Date();

        // Insert booking baru ke database
        const created = await pool.query(
            `INSERT INTO bookings (user_id, room_id, check_in, check_out) 
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [userId, roomId, checkIn, checkOut]
        );

        // Commit transaksi jika semua berhasil
        await pool.query('COMMIT');

        return res.status(201).json({
            message: `Booking dari user ${userId} telah dibuat.`,
            data: created.rows[0]
        });
    } catch (error) {
        // Rollback jika terjadi error
        await pool.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

/**
 * Mengupdate data booking yang sudah ada
 * - Validasi keberadaan booking, user, dan room
 * - Menggunakan transaksi untuk memastikan data consistency
 * - Room diidentifikasi menggunakan room_number
 * 
 * @param {Express.Request} req - Object request dari Express
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi booking yang sudah diupdate atau error message
 */
const updateBooking = async (req, res) => {
    const { id, user_id, room_number, check_in, check_out } = req.body;

    // Validasi input field
    if (!id || !user_id || !room_number || !check_in || !check_out) {
        return res.status(400).json({ message: 'Data field kosong.' });
    }

    try {
        // Mulai transaksi database
        await pool.query('BEGIN');

        // Cek apakah booking dengan id tersebut ada
        const isExist = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (isExist.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: `Booking dengan id ${id} tidak ditemukan.` });
        }

        // Cek apakah user dengan id tersebut ada
        const getUser = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
        if (getUser.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: `Pengguna dengan id ${user_id} tidak ditemukan atau invalid.` });
        }

        // Ambil id room menggunakan room_number
        const getRoom = await pool.query('SELECT id FROM rooms WHERE room_number = $1', [room_number]);
        if (getRoom.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: `Kamar dengan nomor ${room_number} tidak ditemukan atau invalid.` });
        }

        const userId = getUser.rows[0].id;
        const roomId = getRoom.rows[0].id;
        const checkIn = check_in || new Date();
        const checkOut = check_out || new Date();

        // Update data booking
        const updated = await pool.query(
            `UPDATE bookings SET user_id = $1, room_id = $2, check_in = $3, check_out = $4 
            WHERE id = $5 RETURNING *`,
            [userId, roomId, checkIn, checkOut, id]
        );

        // Commit transaksi jika semua berhasil
        await pool.query('COMMIT');

        return res.status(200).json({
            message: `Booking dengan id ${id} telah diperbarui.`,
            data: updated.rows[0]
        });
    } catch (error) {
        // Rollback jika terjadi error
        await pool.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

/**
 * Menghapus booking dari database
 * - Validasi keberadaan booking sebelum menghapus
 * - Menggunakan transaksi untuk memastikan data consistency
 * - Menghapus booking beserta data payment terkait (jika ada)
 * 
 * @param {Express.Request} req - Object request dari Express
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi konfirmasi penghapusan atau error message
 */
const deleteBooking = async (req, res) => {
    const { id } = req.body;

    // Validasi input field
    if (!id) {
        return res.status(400).json({ message: 'ID booking tidak boleh kosong.' });
    }

    try {
        // Mulai transaksi database
        await pool.query('BEGIN');

        // Cek apakah booking dengan id tersebut ada
        const isExist = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (isExist.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: `Booking dengan id ${id} tidak ditemukan.` });
        }

        // Hapus payment terkait (jika ada) untuk menjaga foreign key constraint
        await pool.query('DELETE FROM payments WHERE booking_id = $1', [id]);

        // Hapus booking dari database
        const deleted = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING *', [id]);

        // Commit transaksi jika semua berhasil
        await pool.query('COMMIT');

        return res.status(200).json({
            message: `Booking dengan id ${id} telah dihapus.`,
            data: deleted.rows[0]
        });
    } catch (error) {
        // Rollback jika terjadi error
        await pool.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

/**
 * Update status booking (untuk staff)
 * - Validasi keberadaan booking
 * - Status: pending, dikonfirmasi, selesai, dibatalkan
 * 
 * @param {Express.Request} req - Object request dengan body: { id, status }
 * @param {Express.Response} res - Object response dari Express
 * @returns {Promise<void>} JSON berisi booking yang sudah diupdate
 */
const updateBookingStatus = async (req, res) => {
    const { id, status } = req.body;

    // Validasi input
    if (!id || !status) {
        return res.status(400).json({ message: 'ID dan status booking wajib diisi.' });
    }

    // Validasi status yang valid
    const validStatuses = ['pending', 'dikonfirmasi', 'selesai', 'dibatalkan'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Status tidak valid. Gunakan: ${validStatuses.join(', ')}` });
    }

    try {
        // Cek apakah booking ada
        const isExist = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (isExist.rowCount <= 0) {
            return res.status(404).json({ message: `Booking dengan id ${id} tidak ditemukan.` });
        }

        // Update status booking
        const updated = await pool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        return res.status(200).json({
            message: `Status booking ${id} berhasil diubah menjadi ${status}.`,
            data: updated.rows[0]
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

// ====================================
// EXPORTS
// ====================================

export {
    getBookings,
    getUserBookings,
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking
};