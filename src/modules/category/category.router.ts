import express from "express";
import authMiddleware from "../../middlewares/auth";
import { categoryController } from "./category.controller";
import { UserRole } from "../../../generated/prisma/client";

const router = express.Router();

router.post(
  "/",
  authMiddleware(UserRole.ADMIN),
  categoryController.createCategory,
);
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getSingleCategory);
router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  categoryController.deleteSingleCategory,
);

export const categoryRouter = router;
