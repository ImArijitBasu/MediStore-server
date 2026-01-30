
import { Request, Response, NextFunction } from "express";
import { GetAllMedicinesFilters, medicineService } from "./medicine.service";

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

const getAllMedicines = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      search,
      category,
      manufacturer,
      minPrice,
      maxPrice,
      page = '1',
      limit = '50',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const skip = (pageNum - 1) * limitNum;

    const filters = {
      search: search as string,
      category: category as string,
      manufacturer: manufacturer as string,
      ...(minPrice !== undefined && minPrice !== null && minPrice !== ''
        ? { minPrice: parseFloat(minPrice as string) }
        : {}),
      ...(maxPrice !== undefined && maxPrice !== null && maxPrice !== ''
        ? { maxPrice: parseFloat(maxPrice as string) }
        : {}),
      take: limitNum,
      skip,
      sortBy: sortBy as 'price' | 'name' | 'createdAt' | 'rating',
      sortOrder: sortOrder as 'asc' | 'desc',
    } as GetAllMedicinesFilters;

    const result = await medicineService.getAllMedicines(filters);
    res.status(result.statusCode).json(result);
  } catch (e) {
    next(e);
  }
};

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
        error: "sellers can only update medicines",
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
