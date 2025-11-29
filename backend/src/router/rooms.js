import { Router } from 'express';
import {
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom
} from '../database/queries/rooms.js';

const router = Router();

// GET
router.get('/', getRoom);
router.get('/:room_number', getRoom);

// POST
router.post('/create', createRoom);

// PUT
router.put('/update', updateRoom)

// DELETE
router.delete('/delete', deleteRoom);

export default router;