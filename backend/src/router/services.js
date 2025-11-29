import { Router } from 'express';
import {
    getService,
    createService,
    updateService,
    deleteService
} from '../database/queries/services.js';

const router = Router();

// GET
router.get('/', getService);
router.get('/:id', getService);

// POST
router.post('/create', createService);

// PUT
router.put('/update', updateService);

// DELETE
router.delete('/delete', deleteService);

export default router;