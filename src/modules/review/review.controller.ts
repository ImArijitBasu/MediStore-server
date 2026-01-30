import { Request, Response, NextFunction } from "express";
import { reviewService } from "./review.service";

const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null,
      });
    }

    const { medicineId, orderId, rating, comment } = req.body;

    if (!medicineId || !orderId || !rating) {
      return res.status(400).json({
        success: false,
        message: "medicineId, orderId, and rating are required",
        data: null,
      });
    }

    const result = await reviewService.createReview(
      req.user.id,
      medicineId,
      orderId,
      rating,
      comment,
    );

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const getMedicineReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { medicineId } = req.params;

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
        data: null,
      });
    }

    const result = await reviewService.getMedicineReviews(medicineId as string);

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewController = {
  createReview,
  getMedicineReviews,
};
