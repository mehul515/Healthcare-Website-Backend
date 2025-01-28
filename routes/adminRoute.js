import express from "express";
import { loginAdmin } from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { deleteCaregiver, getCaregiverById, getCaregivers, updateCaregiver, updateCaregiverStatus } from "../controllers/caregiverController.js";
import { addDoctor } from "../controllers/doctorControllers.js";
import { verifyBlog } from "../controllers/blogController.js";

const adminRouter = express.Router();

// Route for the admin to login
adminRouter.post('/login', loginAdmin)

// Route for the admin to add doctor
adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor)

// Route for the admin to verify blog
adminRouter.put('/verify-blog/:id', authAdmin, verifyBlog)

// Route for getting all caregivers
adminRouter.get("/caregivers", authAdmin, getCaregivers);

// Route for the admin to get caregiver by ID
adminRouter.get('/caregivers/:id', authAdmin, getCaregiverById);

// Route for the admin to update a caregiver
adminRouter.put('/caregivers/:id', authAdmin, updateCaregiver);

// Route for the admin to approve or reject a caregiver
adminRouter.put('/caregivers/:id/status', authAdmin, updateCaregiverStatus);

// Route for the admin to delete a caregiver by ID
adminRouter.delete('/caregivers/:id', authAdmin, deleteCaregiver);

export default adminRouter;