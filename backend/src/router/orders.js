import { Router } from 'express';
import { getMidtransTransactionDetail, getOrders, getUserOrders, getAllOrders, createOrder, updateOrderStatus, callback } from '../database/queries/orders.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.get('/', getOrders);
router.get('/all', authorize(['staff', 'admin']), getAllOrders); // Semua orders dengan detail (staff/admin)
router.get('/user/:user_id', authorize(), getUserOrders); // Orders milik user tertentu
router.get('/:id', getOrders);

router.get('/midtrans/:orderId', getMidtransTransactionDetail);

router.post('/create', createOrder);
router.post('/callback', callback);

router.put('/status', authorize(['staff', 'admin']), updateOrderStatus); // Update status (staff/admin only)

export default router;