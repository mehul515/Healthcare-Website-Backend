import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const caregiverSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
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
        phone: {
            type: String,
            required: true,
        },
        address: {
            street: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            postalCode: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
            },
        },
        age: {
            type: Number,
            required: true,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            required: true,
        },
        fees: {
            type: Number,
            required: true,
        },
        reviews: {
            type: [reviewSchema],
            default: [],
        },
        available: {
            type: Boolean,
            default: true,
        },
        bio: {
            type: String,
            required: true,
        },
        experience: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
            default: "https://res.cloudinary.com/dprf9aibr/image/upload/v1735640063/healthNexus/pes0rbycztlthfogzvyi.png"
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

const Caregiver = mongoose.model('Caregiver', caregiverSchema);

export default Caregiver;