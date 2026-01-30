// modules/medicine/medicine.route.ts
import { Router } from "express";
import { medicineController } from "./medicine.controller";
import authMiddleware from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", medicineController.getAllMedicines);
router.get("/:id", medicineController.getSingleMedicine);

//todo SELLER ROUTES 
router.post(
  "/",
  authMiddleware(UserRole.SELLER),
  medicineController.createMedicine,
);
router.get(
  "/seller/inventory",
  authMiddleware(UserRole.SELLER),
  medicineController.getSellerMedicines,
);
router.put(
  "/seller/:id",
  authMiddleware(UserRole.SELLER),
  medicineController.updateSellerMedicine,
);
router.delete(
  "/seller/:id",
  authMiddleware(UserRole.SELLER),
  medicineController.deleteSellerMedicine,
);

export const medicineRouter = router;
