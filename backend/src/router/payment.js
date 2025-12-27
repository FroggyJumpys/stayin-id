import { Router } from 'express';
import { createPayment } from '../database/queries/payment.js';

const router = Router();

router.get('/', (req, res) => res.status(200).json({ message: 'Hello' }));

router.post('/create', createPayment);

export default router;