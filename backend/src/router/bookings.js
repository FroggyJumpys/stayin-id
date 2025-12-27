import { Router } from 'express';
import {
    createBooking,
    getBookings,
    getUserBookings,
    updateBooking,
    deleteBooking
} from '../database/queries/bookings.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.get('/', getBookings);
router.get('/search/:id', getBookings);
router.get('/search/:user_id', getUserBookings);

router.post('/create', authorize(), createBooking);

router.put('/update', authorize(), updateBooking);

router.delete('/delete', authorize(), deleteBooking);

export default router;