import { Router } from 'express';
import { callback, createPayment, getMidtransTransactionDetail, getPayment } from '../database/queries/payment.js';

const router = Router();

router.get('/', getPayment);
router.get('/midtrans/:orderId', getMidtransTransactionDetail)

router.post('/create', createPayment);
router.post('/callback', callback);

export default router;