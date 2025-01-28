import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import userRouter from "./routes/userRoute.js";
import blogRouter from "./routes/blogRoute.js"
import caregiverRoute from "./routes/caregiverRoute.js"

// app configurations
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// middlewares
app.use(express.json())
app.use(cors());

// api endpoints
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)
app.use("/api/blog", blogRouter);
app.use('/api/caregivers', caregiverRoute);


app.get("/", (req, res)=>{
    res.send("API Working fine");
})

app.listen(port, ()=>console.log("Server Running on Port", port));