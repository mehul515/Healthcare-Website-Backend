// middlewares/authCaregiver.js

import jwt from 'jsonwebtoken';
import Caregiver from '../models/caregiverModel.js';

const authCaregiver = async (req, res, next) => {
    try {
        // Extract the token from the Authorization header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: "Authorization token is missing" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the caregiver associated with the decoded user ID
        const caregiver = await Caregiver.findById(decoded.id);

        if (!caregiver) {
            return res.status(404).json({ message: "Caregiver not found" });
        }

        // Attach caregiver data to the request object
        req.user = caregiver;

        // Continue to the next middleware or controller
        next();
    } catch (error) {
        return res.status(500).json({ message: "Error authenticating caregiver", error });
    }
};

export default authCaregiver;
