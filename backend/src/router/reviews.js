import { Router } from 'express';
import {
    getReview,
    createReview,
    updateReview,
    deleteReview,
    getRecentReview,
    getLatestReviews
} from '../database/queries/reviews.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

// GET
router.get('/', getReview);
router.get('/latest', getLatestReviews); // 5 review terbaru untuk homepage
router.get('/data/recent', getRecentReview);
router.get('/:user_id', getReview);

// POST
router.post('/create', authorize(), createReview); // Harus login untuk create review

// PUT
router.put('/update', authorize(), updateReview);

// DELETE
router.delete('/delete', authorize(), deleteReview);

export default router;