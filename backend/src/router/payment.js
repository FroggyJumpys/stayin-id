import { Router } from 'express';
import { createPayment, getMidtransTransactionDetail, getPayment } from '../database/queries/payment.js';

const router = Router();

router.get('/', getPayment);
router.get('/midtrans/:orderId', getMidtransTransactionDetail)

router.post('/create', createPayment);

export default router;