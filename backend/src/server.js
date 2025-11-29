import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser'

import userAPI from './router/users.js';

const app = express();

const PORT = process.env.APP_PORT || 3000;
const HOST = process.env.APP_HOST;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: [`http://localhost:5173`], credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api/users', userAPI);

app.get('/', (req, res) => {
    return res.json({ message: 'Server is up and running!' });
});

app.use((err, req, res, next) => {
    if (err) {
        console.error('ERROR: ', err.message);
        return res.status(500).send('Internal Server Error');
    };
    next();
});

app.listen(PORT, () => {
    console.log(`Server is online at http://localhost/${PORT} or ${HOST}`);
});