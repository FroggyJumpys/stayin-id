import { Pool } from 'pg';

const HOST = process.env.DB_HOST;
const PORT = process.env.DB_PORT;
const USER = String(process.env.DB_USER);
const PASS = String(process.env.DB_PASSWORD);
const DB = process.env.DB_NAME;

const pool = new Pool({
    host: HOST,
    port: PORT,
    user: USER,
    password: PASS,
    database: DB,
});

export default pool;