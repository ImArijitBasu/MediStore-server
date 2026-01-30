import { Request, Response, NextFunction } from "express";
import { orderService } from "./order.service";
import { OrderStatus } from "../../../generated/prisma/client";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null,
      });
    }

    const result = await orderService.createOrder(req.user.id, req.body);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (
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

    const result = await orderService.getUserOrders(req.user.id);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderDetails = async (
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

    const result = await orderService.getOrderDetails(
      req.params.orderId as string,
      req.user.id,
      req.user.role,
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

const getSellerOrders = async (
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

    const result = await orderService.getSellerOrders(req.user.id);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (
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

    const { status, notes } = req.body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
        data: null,
      });
    }

    const result = await orderService.updateOrderStatus(
      req.params.orderId as string,
      req.user.id,
      status,
      notes,
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

const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null,
      });
    }

    const result = await orderService.cancelOrder(
      req.params.orderId as string,
      req.user.id,
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

const trackOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const result = await orderService.trackOrder(orderNumber as string, userId, userRole);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const orderController = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  getSellerOrders,
  updateOrderStatus,
  cancelOrder,
  trackOrder,
};
