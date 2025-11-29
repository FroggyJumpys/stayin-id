import { Router } from 'express';
import {
    createUser,
    deleteUser,
    getUsers,
    loginUser,
    logoutUser,
    updateUser
} from '../database/queries/users.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

// GET
router.get('/', getUsers);
router.get('/:email', getUsers);

// POST
router.post('/auth/register', createUser);
router.post('/auth/login', loginUser);
router.post('/auth/logout', authorize(), logoutUser);

// PUT
router.put('/auth/update', updateUser);

// DELETE
router.delete('/auth/delete', deleteUser);

export default router;