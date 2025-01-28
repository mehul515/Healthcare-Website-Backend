// models/blogModel.js

import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'authorType', // Use this to dynamically resolve the reference
  },
  authorType: {
    type: String,
    required: true,
    enum: ['user', 'doctor', 'caregiver'], // Can be 'user', 'doctor', or 'caregiver'
  },
  isVerified:{
    type:Boolean,
    default:false
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;