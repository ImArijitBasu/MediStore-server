import { Request, Response } from "express";
import { userService } from "./user.service";
import { UserRole } from "../../../generated/prisma/client";

const getStats = async (req: Request, res: Response) => {
  const user = (req as any).user;
  let result;

  if (user.role === UserRole.SELLER) {
    result = await userService.getSellerStats(user.id);
  } else if (user.role === UserRole.CUSTOMER) {
    result = await userService.getCustomerStats(user.id);
  } else {
    // Admins have their own stats route in admin.router.ts, but just in case
    return res.status(403).json({
      success: false,
      message: "Role not supported for this stats endpoint",
      data: null,
    });
  }

  res.status(result.statusCode).json(result);
};

export const userController = {
  getStats,
};
