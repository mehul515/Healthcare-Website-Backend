import express from "express";
import { registerUser, loginUser, updateUserProfile, updatePlan } from "../controllers/userController.js";
import upload from "../middlewares/multer.js";
import verifyUserToken from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.put("/:id", verifyUserToken, upload.single("image"), updateUserProfile);
userRouter.post("/update-plan", updatePlan);

export default userRouter;