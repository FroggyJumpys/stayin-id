import crypto from 'crypto';
import bcrypt from 'bcrypt';

import pool from "../db.js";

const getUsers = async (req, res) => {
    const params = req.params.email;
    try {
        if (params) {
            const data = await pool.query('SELECT * FROM users WHERE email = $1', [params]);
            if (data.rowCount <= 0) return res.status(404).json({ message: `User with the email of ${params} not found.` });
            return res.status(200).json(data.rows[0]);
        };
        const data = await pool.query('SELECT * FROM users');
        return res.json(data.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    };
};

const createUser = async (req, res) => {
    const { full_name, email, password, phone } = req.body;

    try {
        await pool.query('BEGIN');

        // check apakah user sudah ada melalui userid
        const isExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (isExist.rowCount > 0) {
            await pool.query('ROLLBACK');
            return res.status(409).json({ message: 'User sudah ada.' });
        };

        const userId = crypto.randomUUID();
        const hashPassword = await bcrypt.hash(password, 10);

        const data = await pool.query(
            'INSERT INTO users (id, full_name, email, password_hash, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, full_name, email, hashPassword, phone]
        );

        await pool.query('COMMIT');

        res.status(201).json({
            message: `User dengan email: ${email} berhasil di buat.`,
            data: data.rows[0]
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const updateUser = async (req, res) => {
    const { target_email, full_name, email, password, phone } = req.body;

    try {
        await pool.query('BEGIN');

        const isExist = await pool.query('SELECT * FROM users WHERE email = $1', [target_email]);
        if (isExist.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'User tidak ada.' });
        };

        const updatedAt = new Date();
        const hashPassword = await bcrypt.hash(password, 10);

        const data = await pool.query(
            'UPDATE users SET full_name = $1, email = $2, password_hash = $3, phone = $4, updated_at = $5 WHERE email = $6 RETURNING *',
            [full_name, email, hashPassword, phone, updatedAt, target_email]
        );

        await pool.query('COMMIT');

        return res.status(200).json({
            message: `User with the previous email of ${target_email} has been updated`,
            data: data.rows[0]
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteUser = async (req, res) => {
    const email = req.body.email

    try {
        await pool.query('BEGIN');

        const isExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (isExist.rowCount <= 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'User tidak ada.' });
        };

        const data = await pool.query('DELETE FROM users WHERE email = $1', [email]);

        await pool.query('COMMIT');

        res.status(200).json({ message: `User with the email of ${email} has been deleted.` });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export { getUsers, createUser, updateUser, deleteUser };