import { Router } from "express";
import { reviewController } from "./review.controller";
import { authMiddleware } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/client";

const router = Router();

router.post(
  "/",
  authMiddleware(UserRole.CUSTOMER),
  reviewController.createReview,
);

router.get("/medicine/:medicineId", reviewController.getMedicineReviews);


export const reviewRouter = router;