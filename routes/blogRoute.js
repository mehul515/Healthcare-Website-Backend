import express from 'express';
import { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog } from '../controllers/blogController.js';
import verifyUserToken from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to get all blogs (accessible to everyone)
router.get('/getAll', getAllBlogs);

// Route to get a single blog by ID
router.get('/get/:id', getBlogById);

// Route to create a new blog (requires authentication)
router.post('/create', verifyUserToken, createBlog);

// Route to update a blog by ID (requires authentication and only the blog author can update)
router.put('/update/:id', verifyUserToken, updateBlog);

// Route to delete a blog by ID (requires authentication and only the blog author can delete)
router.delete('/delete/:id', verifyUserToken, deleteBlog);

export default router;
