import express from 'express';
import { addCaregiver, getCaregivers, getCaregiverById, updateCaregiver, deleteCaregiver, addReview, getMe, login } from '../controllers/caregiverController.js';
import verifyUserToken from '../middlewares/authMiddleware.js'; // Assuming this is the middleware you already have
// import multer from 'multer';
import authCaregiver from '../middlewares/authCaregiver.js';
import upload from "../middlewares/multer.js";
const router = express.Router();

// Route to add a new caregiver
router.post('/add', upload.single('image'), addCaregiver);

// Route to login a caregiver
router.post('/login', login);

// Route to get all caregivers
router.get('/', getCaregivers);

// Route for the caregiver to get their own details
router.get('/me', authCaregiver, getMe);

// Route to get caregiver by ID
router.get('/:id', verifyUserToken, getCaregiverById);

// Route to update a caregiver by ID
router.put('/:id', authCaregiver, upload.single('image'), updateCaregiver);

// Route to delete a caregiver by ID
router.delete('/:id', authCaregiver, deleteCaregiver);

// Route to add a review for a caregiver
router.post('/:caregiverId/review', verifyUserToken, addReview);

export default router;