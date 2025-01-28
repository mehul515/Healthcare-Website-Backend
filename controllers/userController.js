import validator from "validator"
import bycrypt from "bcrypt"
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary"
import stripe from "stripe";

//api to register user
const registerUser = async (req, res) => {
  try {

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details!" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email!" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password!" });
    }

    // hashing user password
    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword
    }

    const newUser = new userModel(userData)
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    user.password = "";
    return res.json({ success: true, token, user })

  } catch (error) {
    (error)
    return res.json({ success: false, message: error.message })
  }
}

//api to login user
const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ success: false, message: "Missing Details!" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist!" });
    }

    const isMatch = await bycrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      user.password = "";
      return res.json({ success: true, token, user })
    } else {
      return res.json({ success: false, message: "Invalid Credentials!" });
    }

  } catch (error) {
    (error)
    return res.json({ success: false, message: error.message })
  }
}

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {

    const { name, email, password, address, gender, dob, phone, medicalHistory } = req.body;
    const imageFile = req.file;

    // Validate inputs (if required fields must be present)
    if (!name && !email && !password && !address && !gender && !dob && !phone && !imageFile && !medicalHistory) {
      return res.json({ success: false, message: "No updates provided" });
    }

    const updateData = {};

    // Update name
    if (name) {
      updateData.name = name;
    }

    // Update email
    if (email) {
      if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Please enter a valid email" });
      }
      updateData.email = email;
    }

    // Update password
    if (password) {
      if (password.length < 8) {
        return res.json({ success: false, message: "Please enter a strong password" });
      }
      const salt = await bycrypt.genSalt(10);
      updateData.password = await bycrypt.hash(password, salt);
    }

    // Update phone
    if (phone) {
      updateData.phone = phone;
    }

    // Update address
    if (address) {
      updateData.address = address;
    }

    // Update gender
    if (gender) {
      updateData.gender = gender;
    }

    // Update DOB
    if (dob) {
      updateData.dob = dob;
    }

    // Update medical history
    if (medicalHistory) {
      updateData.medicalHistory = JSON.parse(medicalHistory);
    }

    if (imageFile) {
      // Find the user to retrieve the old image public ID
      const user = await userModel.findById(req.params.id);

      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }

      // If the user already has an image and it's different from the new one
      if (user.image) {
        // Extract the public ID from the image URL
        const publicId = "healthNexus/"+user.image.split('/').pop().split('.')[0];

        await cloudinary.uploader.destroy(publicId);
      }

      // Upload the new image
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
        folder: "healthNexus"
      });
      updateData.image = imageUpload.secure_url; // Save the new image URL
      console.log("New image uploaded:", imageUpload.secure_url); // Log the new image URL
    }

    // Find and update the user
    const updatedUser = await userModel.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedUser) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


// API for Admin for fetching all caregivers
const getPatients = async (req, res) => {
  try {
      const patients = await userModel.find();
      res.json({ success: true, patients });
  } catch (error) {
      console.error(error);
      res.json({ success: false, message: error.message });
  }
};


// Backend for upgrading plan

// Stripe initialization with secret key
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// Plan price list (prices in cents)
const PLAN_PRICES = {
    Plus: 999, // Price in cents (e.g., $9.99)
    Premium: 1999, // Price in cents (e.g., $19.99)
};

// Plan upgrading function
const updatePlan = async (req, res) => {
    try {
        // Extract data from the request body
        const { userId, newPlan, paymentIntentId } = req.body;

        // Validate the selected plan
        if (!["Plus", "Premium"].includes(newPlan)) {
            return res.status(400).json({success:false, message: "Invalid plan type." });
        }

        // Fetch the user from the database
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({success:false, message: "User not found." });
        }

        // Verify payment with Stripe by retrieving the PaymentIntent
        const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({success:false, message: "Payment not verified or failed." });
        }

        // Cross-check the payment amount against the expected plan price
        const expectedAmount = PLAN_PRICES[newPlan]; // Get expected price for the selected plan
        if (paymentIntent.amount !== expectedAmount) {
            return res.status(400).json({success:false, message: "Payment amount does not match the selected plan." });
        }

        // Update the user's plan and expiry date
        user.plan = newPlan;
        const now = new Date();
        const oneYearFromNow = new Date(now.setFullYear(now.getFullYear() + 1));
        user.planExpiry = oneYearFromNow;

        // Save the changes to the user model
        await user.save();

        // Respond with success
        return res.status(200).json({
            success:true,
            message: `Plan updated to ${newPlan}.`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                plan: user.plan,
                planExpiry: user.planExpiry,
            }
        });
    } catch (error) {
        console.error("Error updating plan:", error);
        return res.status(500).json({success:false, message: "Internal server error." });
    }
};


export { registerUser, loginUser, updateUserProfile, getPatients, updatePlan }