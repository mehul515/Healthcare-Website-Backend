import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "https://res.cloudinary.com/dprf9aibr/image/upload/v1735640063/healthNexus/pes0rbycztlthfogzvyi.png"
    },
    address: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        default: "Not Selected",   
    },
    dob: {
        type: String,
        default: "Not Selected",
    },
    phone: {
        type: String,
        default: "0000000000",
    },
    medicalHistory: [
        {
          condition: { type: String }, // Name of the condition
          diagnosisDate: { type: Date }, // When it was diagnosed
          notes: { type: String }, // Additional notes
        },
    ],
    plan: {
        type: String,
        enum: ["Free", "Plus", "Premium"],
        default: "Free",
    },
    planExpiry: {
        type: Date, // Null for Free plan or no active subscription
        default: null,
    },
}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;