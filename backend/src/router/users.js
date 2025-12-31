import { Router } from 'express';
import {
    createUser,
    deleteUser,
    getGrowth,
    getUsers,
    getRecentUser,
    getUserData,
    loginUser,
    logoutUser,
    updateUser,
    changePassword
} from '../database/queries/users.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

// GET
router.get('/', getUsers);
router.get('/:email', getUsers);
router.get('/data/recent', getRecentUser);
router.get('/data/:user_id', authorize(), getUserData); // Data lengkap user + statistik
router.get('/admin/growth', authorize(), getGrowth);
router.get('/auth/me', authorize(), (req, res) => {
    return res.json(req.user);
});

// POST
router.post('/auth/register', createUser);
router.post('/auth/login', loginUser);
router.post('/auth/logout', authorize(), logoutUser);

// PUT
router.put('/auth/update', authorize('admin'), updateUser);
router.put('/auth/changepassword', changePassword)

// DELETE
router.delete('/auth/delete', authorize(), deleteUser);

export default router;