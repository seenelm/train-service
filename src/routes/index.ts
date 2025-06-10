import { Router } from "express";
import userRoutes from "./user.routes.js";
import userProfileRoutes from "./user-profile.routes.js";

const router = Router();

router.use("/user", userRoutes);
router.use("/user-profile", userProfileRoutes);

export default router;
