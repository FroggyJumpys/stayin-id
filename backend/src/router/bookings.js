import { Router } from 'express';
import {
    createBooking,
    getBookings,
    getUserBookings,
    updateBooking,
    updateBookingStatus,
    deleteBooking
} from '../database/queries/bookings.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.get('/', getBookings);
router.get('/search/:id', getBookings);
router.get('/user/:user_id', authorize(), getUserBookings); // Bookings milik user tertentu

router.post('/create', authorize(), createBooking);

router.put('/update', authorize(), updateBooking);
router.put('/status', authorize(['staff', 'admin']), updateBookingStatus); // Update status (staff/admin only)

router.delete('/delete', authorize(), deleteBooking);

export default router;