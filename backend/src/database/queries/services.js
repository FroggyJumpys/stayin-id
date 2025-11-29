import pool from '../db.js';

// =============================================================
// SERVICE QUERY HANDLERS
// =============================================================
// File ini berisi handler CRUD untuk entitas "services".
// Setiap operasi tulis (create, update, delete) dibungkus dalam
// transaksi (BEGIN/COMMIT/ROLLBACK) agar konsisten dan atomic.

// Daftar kategori layanan yang valid
const serviceCategory = ['room_service', 'cleaning', 'food', 'laundry', 'spa'];

/**
 * Mengambil data layanan (service).
 * - Jika parameter path `id` diberikan, ambil satu layanan spesifik.
 * - Jika tidak ada, kembalikan semua layanan terurut berdasarkan id.
 * @param {Express.Request} req Express request (params: id opsional)
 * @param {Express.Response} res Express response
 * @returns {Promise<void>} JSON layanan atau pesan error
 */
const getService = async (req, res) => {
    const search = req.params.id;

    try {
        if (search) {
            const data = await pool.query('SELECT * FROM services WHERE id = $1', [search]);
            if (data.rowCount <= 0) return res.status(404).json({ message: `Service dengan nama ${search} tidak ditemukan.` });
            return res.status(200).json(data.rows[0]);
        }

        const data = await pool.query('SELECT * FROM services ORDER BY id ASC');
        return res.json(data.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    };
};

/**
 * Membuat layanan (service) baru.
 * - Validasi field wajib terisi
 * - Validasi kategori terhadap daftar yang diizinkan
 * - Validasi tipe data price harus angka
 * - Cek duplikasi berdasarkan nama layanan
 * - Transaksi untuk menjaga konsistensi data
 * @param {Express.Request} req body: { name, category, price, description }
 * @param {Express.Response} res Express response
 * @returns {Promise<void>} JSON layanan baru atau pesan error
 */
const createService = async (req, res) => {
    const { name, category, price, description } = req.body;

    const parsedPrice = Number(price); // Konversi untuk validasi

    if (!name || !category || !price || !description)
        return res.status(400).json({ message: 'Data field kosong.' });

    if (!serviceCategory.includes(category))
        return res.status(422).json({ message: `Kategori yang valid: ${serviceCategory.join(' / ')}` });

    if (isNaN(parsedPrice))
        return res.status(422).json({ message: 'Tipe data harga tidak valid.' });

    try {
        await pool.query('BEGIN'); // Mulai transaksi

        // Cek duplikasi: pastikan nama layanan belum ada
        const isExist = await pool.query('SELECT * FROM services WHERE name = $1', [name]);
        if (isExist.rowCount > 0) {
            await pool.query('ROLLBACK');
            return res.status(409).json({ message: `Layanan dengan nama ${name} sudah ada.` });
        }

        const data = await pool.query(
            'INSERT INTO services (name, category, price, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, category, price, description]
        );

        await pool.query('COMMIT'); // Sukses => commit

        return res.status(201).json({ message: `Layanan dengan nama ${name} berhasil dibuat.`, data: data.rows[0] });
    } catch (error) {
        await pool.query('ROLLBACK'); // Error => rollback
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

/**
 * Memperbarui data layanan (service) yang sudah ada.
 * - Validasi field wajib dan tipe data (price dan target_id harus angka)
 * - Validasi kategori terhadap daftar yang diizinkan
 * - Cek keberadaan layanan berdasarkan id
 * - Update dengan timestamp terbaru
 * @param {Express.Request} req body: { target_id, name, category, price, description }
 * @param {Express.Response} res Express response
 * @returns {Promise<void>} JSON layanan yang diperbarui atau pesan error
 */
const updateService = async (req, res) => {
    const { target_id, name, category, price, description } = req.body;

    const updatedAt = new Date();
    const parsedPrice = Number(price);
    const parsedId = Number(target_id)

    if (!target_id || !name || !category || !price || !description)
        return res.status(400).json({ message: 'Data field kosong.' });

    if (!serviceCategory.includes(category))
        return res.status(422).json({ message: `Kategori yang valid: ${serviceCategory.join(' / ')}` });

    if (isNaN(parsedPrice) || isNaN(parsedId))
        return res.status(422).json({ message: 'Tipe data harga atau id tidak valid.' });

    try {
        await pool.query('BEGIN');

        // Cek apakah layanan dengan id tersebut ada
        const isExist = await pool.query('SELECT * FROM services WHERE id = $1', [parsedId]);
        if (isExist.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: `Layanan dengan id ${parsedId} tidak ditemukan.` });
        }

        const data = await pool.query(
            'UPDATE services SET name = $1, category = $2, price = $3, description = $4, updated_at = $5 WHERE id = $6 RETURNING *',
            [name, category, price, description, updatedAt, parsedId]
        );

        await pool.query('COMMIT');
        res.status(200).json({ message: `Layanan dengan id ${parsedId} berhasil diperbarui.`, data: data.rows[0] });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
};

/**
 * Menghapus layanan (service) berdasarkan id.
 * - Validasi id harus berupa angka
 * - Cek keberadaan layanan sebelum hapus
 * - Transaksi untuk memastikan operasi atomic
 * @param {Express.Request} req body: { id }
 * @param {Express.Response} res Express response
 * @returns {Promise<void>} JSON status penghapusan atau pesan error
 */
const deleteService = async (req, res) => {
    const { id } = req.body;

    if (!id)
        return res.status(400).json({ message: 'Field data kosong.' });

    const parsedId = Number(id);

    if (isNaN(parsedId))
        return res.status(422).json({ message: 'Tipe data id tidak valid.' });

    try {
        await pool.query('BEGIN');

        // Cek apakah layanan dengan id tersebut ada
        const isExist = await pool.query('SELECT * FROM services WHERE id = $1', [parsedId]);
        if (isExist.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: `Layanan dengan id ${parsedId} tidak ditemukan.` });
        }

        await pool.query('DELETE FROM services WHERE id = $1', [parsedId]);

        await pool.query('COMMIT');

        res.status(200).json({ message: `Layanan dengan id ${parsedId} berhasil dihapus.` });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan server internal.' });
    }
}

export {
    getService,
    createService,
    updateService,
    deleteService
}