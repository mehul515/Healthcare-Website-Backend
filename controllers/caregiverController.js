import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import caregiverModel from "../models/caregiverModel.js";
import validator from "validator";
import Caregiver from "../models/caregiverModel.js";
import jwt from "jsonwebtoken"

// API for adding caregiver
const addCaregiver = async (req, res) => {
    try {
        console.log(req.body);
        const { name, email, phone, age, gender, fees, bio, experience, address } = req.body;
        const imageFile = req.file;
        // Check for all required fields to add caregiver
        if (!name || !email || !phone || !age || !gender || !fees || !bio || !experience || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        const password = email;

        // Hash the caregiver's password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Upload image to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image", folder:"healthNexus" });
        const imageUrl = imageUpload.secure_url;

        const caregiverData = {
            name,
            email,
            phone,
            age,
            gender,
            fees,
            bio,
            experience,
            address,
            profilePicture: imageUrl,
            password: hashedPassword,
        };

        const newCaregiver = new caregiverModel(caregiverData);
        await newCaregiver.save();

        res.json({ success: true, message: "Caregiver Added Successfully." });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if caregiver exists
        const caregiver = await Caregiver.findOne({ email });
        if (!caregiver) {
            return res.status(404).json({ message: 'Caregiver not found' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, caregiver.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: caregiver._id, email: caregiver.email },
            process.env.JWT_SECRET, // Use your secret key
            { expiresIn: '7d' } // Token expiration (optional)
        );

        // Send the token as response
        res.status(200).json({
            message: 'Login successful',
            token,
            caregiver: {
                id: caregiver._id,
                name: caregiver.name,
                email: caregiver.email,
                status: caregiver.status,
                // Add other fields if necessary
            }
        });

    } catch (error) {
        console.err(error);
        res.status(500).json({ message: 'Server error', error });
    }
}

// API for fetching all caregivers
const getCaregivers = async (req, res) => {
    try {
        const caregivers = await caregiverModel.find();
        res.json({ success: true, caregivers });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};


// Controller to get the current caregiver's data (me)
const getMe = async (req, res) => {
    try {
        // The caregiver's data is already attached to the req.user object
        const caregiver = req.user;

        // Send the caregiver's data back as the response
        return res.status(200).json(caregiver);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching caregiver data", error });
    }
};

// API for getting a caregiver by ID
const getCaregiverById = async (req, res) => {
    try {
        const caregiver = await caregiverModel.findById(req.params.id);
        if (!caregiver) {
            return res.json({ success: false, message: "Caregiver not found" });
        }
        caregiver.password = "";
        res.json({ success: true, caregiver });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API for updating caregiver details
const updateCaregiver = async (req, res) => {
    try {
        // Find the caregiver by ID
        const caregiver = await caregiverModel.findById(req.params.id);
        if (!caregiver) {
            return res.json({ success: false, message: "Caregiver not found" });
        }

        // Prepare the data for update
        const updatedData = req.body;

        // If a new image is provided
        if (req.file) {
            // Check if the caregiver already has an existing profile picture
            if (caregiver.profilePicture) {
                // Extract the public ID of the old image (including folder name)
                const publicId = "healthNexus/"+caregiver.profilePicture.split('/').pop().split('.')[0];

                // Delete the old image from Cloudinary
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.error("Error deleting old image:", error);
                }
            }

            // Upload the new image to Cloudinary (healthNexus folder)
            const imageUpload = await cloudinary.uploader.upload(req.file.path, {
                resource_type: "image",
                folder: "healthNexus",
            });

            // Save the new image URL
            updatedData.profilePicture = imageUpload.secure_url;
            console.log("New image uploaded:", imageUpload.secure_url);
        }

        // Update the caregiver's profile data
        const updatedCaregiver = await caregiverModel.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        if (!updatedCaregiver) {
            return res.json({ success: false, message: "Caregiver update failed" });
        }

        // Respond with success message and updated data
        res.json({
            success: true,
            message: "Caregiver updated successfully",
            data: updatedCaregiver,
        });
    } catch (error) {
        // Handle errors and log them
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};


// API for deleting a caregiver
const deleteCaregiver = async (req, res) => {
    try {
        const caregiver = await caregiverModel.findByIdAndDelete(req.params.id);
        if (!caregiver) {
            return res.json({ success: false, message: "Caregiver not found" });
        }
        res.json({ success: true, message: "Caregiver deleted successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API for adding a review for a caregiver
const addReview = async (req, res) => {
    try {
        const caregiver = await caregiverModel.findById(req.params.caregiverId);
        if (!caregiver) {
            return res.json({ success: false, message: "Caregiver not found" });
        }

        const { reviewerId, rating, comment } = req.body;

        // Ensure rating is between 1 and 5
        if (rating < 1 || rating > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        // Add the review to caregiver's reviews
        const review = {
            reviewer: reviewerId,
            rating,
            comment,
        };

        caregiver.reviews.push(review);
        await caregiver.save();

        res.json({ success: true, message: "Review added successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};


// Controller for updating caregiver status (admin)
const updateCaregiverStatus = async (req, res) => {
    try {
        const caregiver = await Caregiver.findById(req.params.id); // Finds caregiver by ID
        if (!caregiver) {
            return res.status(404).json({ success: false, message: 'Caregiver not found' });
        }

        // Updating the status of the caregiver (Pending, Approved, Rejected)
        const { status } = req.body;
        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        caregiver.status = status;
        await caregiver.save();

        return res.status(200).json({ success: true, message: 'Caregiver status updated successfully', caregiver });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { addCaregiver, login, getCaregivers, getMe, getCaregiverById, updateCaregiver, deleteCaregiver, addReview, updateCaregiverStatus };