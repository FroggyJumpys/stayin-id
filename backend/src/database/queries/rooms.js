import pool from '../db.js';

// =============================================================
// ROOM QUERY HANDLERS
// =============================================================
// File ini berisi handler CRUD untuk entitas "rooms".
// Setiap operasi tulis (create, update, delete) dibungkus dalam
// transaksi (BEGIN/COMMIT/ROLLBACK) agar konsisten dan atomic.

/**
 * Mengambil data kamar.
 * - Jika parameter path `room_number` diberikan, ambil satu kamar.
 * - Jika tidak ada, kembalikan semua kamar.
 * @param {Express.Request} req Express request (params: room_number opsional)
 * @param {Express.Response} res Express response
 * @returns {Promise<void>} JSON kamar atau pesan error
 */
const getRoom = async (req, res) => {
    const search = req.params.room_number;

    try {
        if (search) {
            const data = await pool.query('SELECT * FROM rooms WHERE room_number = $1', [search]);
            if (data.rowCount <= 0) return res.status(404).json({ message: `Kamar dengan nomor ${search} tidak ditemukan.` });
            return res.status(200).json(data.rows[0]);
        };

        const data = await pool.query('SELECT * FROM rooms ORDER BY room_number ASC');
        return res.json(data.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    };
};

/**
 * Membuat kamar baru.
 * - Validasi field wajib
 * - Cek duplikasi berdasarkan room_number
 * - Memastikan price & capacity bertipe angka
 * - Transaksi untuk menjaga konsistensi data
 * @param {Express.Request} req body: { room_number, room_type, price, capacity }
 * @param {Express.Response} res Express response
 * @returns {Promise<void>} JSON kamar baru atau pesan error
 */
const createRoom = async (req, res) => {
    const { room_number, room_type, price, capacity } = req.body;
    const parsedPrice = Number(price); // Konversi ke number untuk validasi
    const parsedCap = Number(capacity);

    if (!room_number || !room_type || !price || !capacity)
        return res.status(400).json({ message: 'Field data kosong.' });

    // isNaN() digunakan karena perbandingan dengan NaN selalu false
    if (isNaN(parsedPrice) || isNaN(parsedCap))
        return res.status(422).json({ message: 'Tipe harga atau kapasitas tidak valid.' });

    try {
        await pool.query('BEGIN'); // Mulai transaksi

        const isExist = await pool.query('SELECT * FROM rooms WHERE room_number = $1', [room_number]);
        if (isExist.rowCount > 0) {
            await pool.query('ROLLBACK');
            return res.status(409).json({ message: `Kamar dengan nomor ${room_number} sudah ada.` });
        }

        const data = await pool.query(
            'INSERT INTO rooms (room_number, room_type, price, capacity) VALUES ($1, $2, $3, $4) RETURNING *',
            [room_number, room_type, parsedPrice, parsedCap]
        );

        await pool.query('COMMIT'); // Sukses => commit
        res.status(201).json({ message: `Kamar dengan nomor ${room_number} berhasil dibuat.`, data: data.rows[0] });
    } catch (error) {
        await pool.query('ROLLBACK'); // Error => rollback
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

/**
 * Memperbarui data kamar.
 * - Memvalidasi status (tersedia/dibooking/maintenance)
 * - Memastikan field wajib terisi & price/capacity angka
 * - Menggunakan target_room sebagai identitas kamar lama
 * @param {Express.Request} req body: { target_room, room_number, room_type, price, capacity, status }
 * @param {Express.Response} res Express response
 * @returns {Promise<void>} JSON kamar yang diperbarui atau pesan error
 */
const updateRoom = async (req, res) => {
    const roomStatus = ['tersedia', 'dibooking', 'maintenance']; // Daftar status valid
    const updatedAt = new Date();

    const { target_room, room_number, room_type, price, capacity, status } = req.body;
    const parsedPrice = Number(price);
    const parsedCap = Number(capacity);

    if (!room_number || !room_type || !price || !capacity)
        return res.status(400).json({ message: 'Field data kosong.' });

    if (!roomStatus.includes(status))
        return res.status(422).json({ message: `Status yang valid: ${roomStatus.join(' / ')}` });

    if (isNaN(parsedPrice) || isNaN(parsedCap))
        return res.status(422).json({ message: 'Tipe harga atau kapasitas tidak valid.' });

    try {
        await pool.query('BEGIN');

        const isExist = await pool.query('SELECT * FROM rooms WHERE room_number = $1', [target_room]);
        if (isExist.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: `Kamar dengan nomor ${target_room} tidak ditemukan.` });
        }

        const data = await pool.query(
            'UPDATE rooms SET room_number = $1, room_type = $2, price = $3, capacity = $4, status = $5, updated_at = $6 WHERE room_number = $7 RETURNING *',
            [room_number, room_type, parsedPrice, parsedCap, status, updatedAt, target_room]
        );

        await pool.query('COMMIT');

        return res.status(200).json({ message: `Kamar dengan nomor ${target_room} berhasil diperbarui.`, data: data.rows[0] });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    };
};

/**
 * Menghapus kamar berdasarkan room_number.
 * - Cek keberadaan kamar sebelum hapus
 * - Transaksi untuk memastikan operasi atomic
 * @param {Express.Request} req body: { room_number }
 * @param {Express.Response} res Express response
 * @returns {Promise<void>} JSON status penghapusan atau pesan error
 */
const deleteRoom = async (req, res) => {
    const { room_number } = req.body;

    if (!room_number) return res.status(400).json({ message: 'Field data kosong.' });

    try {
        await pool.query('BEGIN');

        const isExist = await pool.query('SELECT * FROM rooms WHERE room_number = $1', [room_number]);
        if (isExist.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: `Kamar dengan nomor ${room_number} tidak ditemukan.` });
        }

        await pool.query('DELETE FROM rooms WHERE room_number = $1', [room_number]);

        await pool.query('COMMIT');

        res.status(200).json({ message: `Kamar dengan nomor ${room_number} berhasil dihapus.` });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

export { getRoom, createRoom, updateRoom, deleteRoom };