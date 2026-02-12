import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getUserProfile } from "../controllers/user.controller.js";
import { cacheProfile } from "../middlewares/cache.middleware.js"

const userRoutes = express.Router();

userRoutes.get("/profile", authMiddleware,cacheProfile, getUserProfile);

export default userRoutes;
