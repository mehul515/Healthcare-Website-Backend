// controllers/blogController.js

import Blog from "../models/blogModel.js";
import User from "../models/userModel.js";  // Assuming you have a User model
import Doctor from "../models/doctorModel.js"; // Assuming you have a Doctor model
// import Caregiver from "../models/caregiverModel.js"; // Assuming you have a Caregiver model

// Blog creation API
export const createBlog = async (req, res) => {
  try {
    const { title, content, authorId, authorType } = req.body;

    // Verify the authorType is valid
    if (!['user', 'doctor', 'caregiver'].includes(authorType)) {
      return res.status(400).json({ message: 'Invalid author type' });
    }

    // Verify the authorId exists
    let author;
    if (authorType === 'user') {
      author = await User.findById(authorId);
    } else if (authorType === 'doctor') {
      author = await Doctor.findById(authorId);
    } 
    // else if (authorType === 'caregiver') {
    //   author = await Caregiver.findById(authorId);
    // }

    if (!author) {
      return res.status(400).json({ message: 'Author not found' });
    }

    // Create the new blog
    const newBlog = new Blog({
      title,
      content,
      author: authorId,
      authorType,
    });

    await newBlog.save();
    return res.status(201).json(newBlog);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating blog", error });
  }
};


export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({isVerified:true}).populate('author', 'name email image'); // Populate author data
        return res.status(200).json(blogs);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching blogs", error });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id).populate('author', 'name email image'); // Populate author data
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.status(200).json(blog);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching blog", error });
    }
};

export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.id;

        // Find the blog by ID and check if the current user is the author
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        if (blog.author.toString() !== userId) {
            return res.status(403).json({ message: "You can only update your own blog" });
        }

        // Update the blog's fields
        blog.title = title || blog.title;
        blog.content = content || blog.content;

        const updatedBlog = await blog.save();
        return res.status(200).json(updatedBlog);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error updating blog", error });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.user.id; // Get the user ID from the token payload (after authentication)
        (userId);

        // Find the blog by its ID
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Check if the logged-in user is the author of the blog
        if (blog.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own blog" });
        }

        // Delete the blog using findByIdAndDelete instead of remove
        await Blog.findByIdAndDelete(blogId);
        return res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error deleting blog", error });
    }
};


// Controller for admin to verify the blog
export const verifyBlog = async (req, res) => {
    try {
        const blogId = req.params.id;

        // Find the blog by its ID
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Update the blog's fields
        blog.isVerified = true;

        const updatedBlog = await blog.save();
        return res.status(200).json(updatedBlog);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error Verifying Blog", error });
    }
}