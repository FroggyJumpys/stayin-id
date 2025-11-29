import { Router } from 'express';
import {
    createUser,
    deleteUser,
    getUsers,
    updateUser
} from '../database/queries/users.js';

const router = Router();

// GET
router.get('/', getUsers);
router.get('/:email', getUsers);

// POST
router.post('/auth/register', createUser);

// PUT
router.put('/auth/update', updateUser);

// DELETE
router.delete('/auth/delete', deleteUser);

export default router;