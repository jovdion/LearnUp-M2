import express from 'express';
import { getAllUserKelas, getUserKelasById, createUserKelas, updateUserKelas, deleteUserKelas, cleanupInvalidRelations } from '../controllers/UserKelasController.js';

const router = express.Router();

router.get('/user_kelas', getAllUserKelas);
router.get('/user_kelas/:id_user/:id_kelas', getUserKelasById);
router.post('/user_kelas', createUserKelas);
router.patch('/user_kelas/:id_user/:id_kelas', updateUserKelas);
router.delete('/user_kelas/:id_user/:id_kelas', deleteUserKelas);
router.post('/user_kelas/cleanup', cleanupInvalidRelations);

export default router;
// The code above defines a route for getting all users. The route uses the getUsers function from the UserController as the handler.
//  