import { Router } from "express";
import { cartController } from "./cart.controller";
import { authMiddleware } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/client";

const router = Router();

router.use(authMiddleware(UserRole.CUSTOMER));


router.post("/add", cartController.addToCart);
router.get("/", cartController.getCart);
router.patch("/:itemId", cartController.updateCartItem);
router.delete("/:itemId", cartController.removeCartItem);
router.delete("/", cartController.clearCart);

export const cartRouter = router;
