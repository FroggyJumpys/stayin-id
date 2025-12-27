import pool from "../db.js";

// =============================================================
// REVIEW QUERY HANDLERS
// =============================================================
// Handler CRUD untuk entitas "reviews".
// Catatan:
// - Validasi input dilakukan sebelum query.
// - Operasi tulis (update/delete) menggunakan transaksi untuk konsistensi.

/**
 * Mengambil data review.
 * - Jika param `user_id` diberikan, ambil semua review milik user tersebut.
 * - Jika tidak, ambil semua review.
 * @param {Express.Request} req Express request (params: user_id opsional)
 * @param {Express.Response} res Express response
 * @returns {Promise<void>} JSON daftar review atau pesan error
 */
const getReview = async (req, res) => {
    const userid = req.params.user_id;

    try {
        if (userid) {
            const data = await pool.query('SELECT * FROM reviews WHERE user_id = $1', [userid]);
            return res.status(200).json({
                message: `Review milik pengguna ${userid} berhasil diambil (total ${data.rowCount} review).`,
                data: data.rows
            });
        }
        const data = await pool.query('SELECT * FROM reviews');
        return res.status(200).json({
            message: `Berhasil mengambil total ${data.rowCount} review.`,
            data: data.rows
        });
    } catch (error) {
        return res.status(500).json({ message: 'Kesalahan server internal.', err: error });
    }
};

const getRecentReview = async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
        return res.status(200).json({
            data: data.rows[0]
        });
    } catch (error) {
        return res.status(500).json({ message: 'Kesalahan server internal.', err: error });
    }
}

/**
 * Membuat review baru.
 * - Validasi field wajib
 * - Validasi rating harus angka
 * @param {Express.Request} req body: { user_id, full_name, rating, comment }
 * @param {Express.Response} res Express response
 * @returns {Promise<void>} JSON review baru atau pesan error
 */
const createReview = async (req, res) => {
    const { user_id, full_name, rating, comment } = req.body;
    const parsedRating = Number(rating);

    if (!user_id || !full_name || !rating || !comment) return res.status(400).json({ message: 'Field data kosong.' });

    if (isNaN(parsedRating)) return res.status(422).json({ message: 'Tipe data rating tidak valid.' });

    try {
        const data = await pool.query(
            'INSERT INTO reviews (user_id, full_name, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, full_name, parsedRating, comment]
        );
        return res.status(201).json({ message: `Review dari pengguna ${user_id} berhasil dibuat.`, data: data.rows[0] });
    } catch (error) {
        return res.status(500).json({ message: 'Kesalahan server internal.', err: error });
    }
};

/**
 * Memperbarui review.
 * - Validasi field wajib & rating angka
 * - Gunakan transaksi untuk memastikan perubahan konsisten
 * @param {Express.Request} req body: { id, full_name, rating, comment }
 * @param {Express.Response} res Express response
 * @returns {Promise<void>} JSON review yang diperbarui atau pesan error
 */
const updateReview = async (req, res) => {
    const { id, full_name, rating, comment } = req.body;
    const updatedAt = new Date();
    const parsedRating = Number(rating);

    if (!id || !full_name || !rating || !comment) return res.status(400).json({ message: 'Field data kosong.' });

    if (isNaN(parsedRating)) return res.status(422).json({ message: 'Tipe data rating tidak valid.' });

    try {
        await pool.query('BEGIN');

        const isExist = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
        if (isExist.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Data review tidak ditemukan.' });
        }

        const data = await pool.query(
            'UPDATE reviews SET full_name = $1, rating = $2, comment = $3, updated_at = $4 WHERE id = $5 RETURNING *',
            [full_name, parsedRating, comment, updatedAt, id]
        );

        await pool.query('COMMIT');

        return res.status(200).json({ message: `Review dengan id ${id} berhasil diperbarui.`, data: data.rows[0] });
    } catch (error) {
        await pool.query('ROLLBACK');
        return res.status(500).json({ message: 'Kesalahan server internal.', err: error });
    }
};

/**
 * Menghapus review berdasarkan id.
 * - Cek keberadaan data sebelum hapus
 * - Transaksi untuk memastikan operasi atomic
 * @param {Express.Request} req body: { id }
 * @param {Express.Response} res Express response
 * @returns {Promise<void>} JSON status penghapusan atau pesan error
 */
const deleteReview = async (req, res) => {
    const { id } = req.body;

    if (!id) return res.status(400).json({ message: 'Field data kosong.' });

    try {
        await pool.query('BEGIN');

        const isExist = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
        if (isExist.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Data review tidak ditemukan.' });
        }

        await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

        await pool.query('COMMIT');

        return res.status(200).json({ message: `Review dengan id ${id} berhasil dihapus.` });
    } catch (error) {
        await pool.query('ROLLBACK');
        return res.status(500).json({ message: 'Kesalahan server internal.', err: error });
    }
};

export { getReview, getRecentReview, createReview, updateReview, deleteReview };