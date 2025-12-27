import { Router } from 'express';
import {
    getReview,
    createReview,
    updateReview,
    deleteReview,
    getRecentReview
} from '../database/queries/reviews.js';

const router = Router();

// GET
router.get('/', getReview);
router.get('/:user_id', getReview);
router.get('/data/recent', getRecentReview);

// POST
router.post('/create', createReview)

// PUT
router.put('/update', updateReview);

// DELETE
router.delete('/delete', deleteReview);

export default router;