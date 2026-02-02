-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_sellerMedicineId_fkey";

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_sellerMedicineId_fkey" FOREIGN KEY ("sellerMedicineId") REFERENCES "SellerMedicine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
