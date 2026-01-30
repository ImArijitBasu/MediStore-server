import { Request, Response, NextFunction } from "express";
import { adminService } from "./admin.service";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getAllUsers();

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getUserById(req.params.userId as string);

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const banUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.banUser(req.params.userId as string);

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const unbanUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.unbanUser(req.params.userId as string);

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await adminService.getStats();

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const adminController = {
  getAllUsers,
  getUserById,
  banUser,
  unbanUser,
  getStats,
};    
