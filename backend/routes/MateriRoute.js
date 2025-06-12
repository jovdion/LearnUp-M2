import express from 'express';
import { getAllMateri, getMateriById, createMateri, updateMateri, deleteMateri } from '../controllers/MateriController.js';

const router = express.Router();

router.get('/materis', getAllMateri);
router.get('/materis/:id', getMateriById);
router.post('/materis', createMateri);
router.patch('/materis/:id', updateMateri);
router.delete('/materis/:id', deleteMateri);

export default router;
// The code above defines a route for getting all users. The route uses the getUsers function from the UserController as the handler.
//  