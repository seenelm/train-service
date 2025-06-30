import { Router } from "express";
import userRoutes from "./user.routes.js";
import userProfileRoutes from "./user-profile.routes.js";
import searchRoutes from "./search.routes.js";

const router = Router();

router.use("/user", userRoutes);
router.use("/user-profile", userProfileRoutes);
router.use("/search", searchRoutes);

export default router;
