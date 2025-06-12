import express from 'express';
import { 
    getUsers, 
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    login,
    logout,
    getMe
} from '../controllers/UserController.js';
// import { verifyToken } from '../middleware/VerifyToken.js';
// import { refreshToken } from '../controllers/RefreshToken.js';

const router = express.Router();

router.get('/users',  getUsers);
router.get('/users/:id',  getUserById);
router.post('/users', createUser);
router.patch('/users/:id',  updateUser);
router.delete('/users/:id', deleteUser);
router.post('/login', login);
//router.get('/token', refreshToken);
router.delete('/logout', logout);
router.get('/me', getMe);

export default router;
// The code above defines a route for getting all users. The route uses the getUsers function from the UserController as the handler.
//  