import { Router } from "express";
import { orderController } from "./order.controller";
import { authMiddleware } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/client";

const router = Router();

// customer
router.post(
  "/",
  authMiddleware(UserRole.CUSTOMER),
  orderController.createOrder,
);
router.get(
  "/my-orders",
  authMiddleware(UserRole.CUSTOMER),
  orderController.getUserOrders,
);
router.get(
  "/:orderId",
  authMiddleware(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  orderController.getOrderDetails,
);
router.patch(
  "/:orderId/cancel",
  authMiddleware(UserRole.CUSTOMER),
  orderController.cancelOrder,
);

// Seller routes
router.get(
  "/seller/orders",
  authMiddleware(UserRole.SELLER),
  orderController.getSellerOrders,
);
router.patch(
  "/seller/orders/:orderId/status",
  authMiddleware(UserRole.SELLER),
  orderController.updateOrderStatus,
);

// Public tracking route
router.get("/track/:orderNumber", orderController.trackOrder);

export const orderRouter= router;
