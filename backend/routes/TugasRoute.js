import express from 'express';
import { getAllTugas, getTugasById, createTugas, updateTugas, deleteTugas } from '../controllers/TugasController.js';

const router = express.Router();

router.get('/tugas', getAllTugas);
router.get('/tugas/:id', getTugasById);
router.post('/tugas', createTugas);
router.patch('/tugas/:id', updateTugas);
router.delete('/tugas/:id', deleteTugas);

export default router;
// The code above defines a route for getting all users. The route uses the getUsers function from the UserController as the handler.
//  