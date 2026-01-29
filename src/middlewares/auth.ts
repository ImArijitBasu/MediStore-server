
import { UserRole, UserStatus } from "../../generated/prisma/client";
import { auth as betterAuth } from "../lib/auth";
import { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        status: UserStatus;
      };
    }
  }
}

export const authMiddleware = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await betterAuth.api.getSession({
        headers: req.headers as any,
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!",
        });
      }

      // attach user (no emailVerified)
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as UserRole,
        status: session.user.status as UserStatus,
      };

      // block banned users
      if (req.user.status === UserStatus.BANNED) {
        return res.status(403).json({
          success: false,
          message: "Your account has been banned.",
        });
      }

      // role based access
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden! You don't have permission to access this resource",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authMiddleware;
