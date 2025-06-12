import express from 'express';
import { getAllSubmission, getSubmissionById, createSubmission, updateSubmission, deleteSubmission } from '../controllers/SubmissionController.js';

const router = express.Router();

router.get('/submissions', getAllSubmission);
router.get('/submissions/:id', getSubmissionById);
router.post('/submissions', createSubmission);
router.patch('/submissions/:id', updateSubmission);
router.delete('/submissions/:id', deleteSubmission);

export default router;
// The code above defines a route for getting all users. The route uses the getUsers function from the UserController as the handler.
//  