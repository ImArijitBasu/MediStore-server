import { Router } from "express";
import { userController } from "./user.controller";
import { authMiddleware } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/client";

const router = Router();

// stats for seller and customer
router.get(
  "/stats",
  authMiddleware(UserRole.SELLER, UserRole.CUSTOMER),
  userController.getStats
);

export const userRouter = router;
