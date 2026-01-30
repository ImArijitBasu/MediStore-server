import { Router } from "express";
import { adminController } from "./admin.controller";
import { authMiddleware } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/client";

const router = Router();
router.use(authMiddleware(UserRole.ADMIN));

// management
router.get("/users", adminController.getAllUsers);
router.get("/users/:userId", adminController.getUserById);
router.patch("/users/:userId/ban", adminController.banUser);
router.patch("/users/:userId/unban", adminController.unbanUser);

// stats
router.get("/stats", adminController.getStats);

export const adminRouter = router;
