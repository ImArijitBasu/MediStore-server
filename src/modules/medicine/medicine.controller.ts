// modules/medicine/medicine.controller.ts
import { Request, Response, NextFunction } from "express";
import { medicineService } from "./medicine.service";

// Create a new medicine (SELLER ONLY)
const createMedicine = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId || req.user?.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        error: "Only sellers can create medicines",
      });
    }

    const data = { ...req.body, sellerId };
    const result = await medicineService.createMedicine(data);

    res.status(result.statusCode).json(result);
  } catch (e) {
    next(e);
  }
};

// Get all medicines (PUBLIC)
const getAllMedicines = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const take = req.query.take ? Number(req.query.take) : 50;
    const skip = req.query.skip ? Number(req.query.skip) : 0;

    const result = await medicineService.getAllMedicines(take, skip);
    res.status(result.statusCode).json(result);
  } catch (e) {
    next(e);
  }
};

// Get a single medicine by ID (PUBLIC)
const getSingleMedicine = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await medicineService.getSingleMedicine(
      req.params.id as string,
    );
    res.status(result.statusCode).json(result);
  } catch (e) {
    next(e);
  }
};

// Update seller's medicine (SELLER ONLY - only their inventory)
const updateSellerMedicine = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.user?.id;
    const medicineId = req.params?.id as string;

    if (!sellerId || req.user?.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        error: "Only sellers can update medicines",
      });
    }

    const result = await medicineService.updateSellerMedicine(
      medicineId,
      sellerId,
      req.body,
    );

    res.status(result.statusCode).json(result);
  } catch (e) {
    next(e);
  }
};

// Remove medicine from seller's inventory (SELLER ONLY)
const deleteSellerMedicine = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.user?.id;
    const medicineId = req.params?.id as string;

    if (!sellerId || req.user?.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        error: "Only sellers can delete medicines",
      });
    }

    const result = await medicineService.deleteSellerMedicine(
      medicineId,
      sellerId,
    );

    res.status(result.statusCode).json(result);
  } catch (e) {
    next(e);
  }
};

// Get seller's medicines (SELLER ONLY)
const getSellerMedicines = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.user?.id;

    if (!sellerId || req.user?.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        error: "Only sellers can view their medicines",
      });
    }

    const result = await medicineService.getSellerMedicines(sellerId);
    res.status(result.statusCode).json(result);
  } catch (e) {
    next(e);
  }
};

export const medicineController = {
  createMedicine,
  getAllMedicines,
  getSingleMedicine,
  updateSellerMedicine,
  deleteSellerMedicine,
  getSellerMedicines,
};
