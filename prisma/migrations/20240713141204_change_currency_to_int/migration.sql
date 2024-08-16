/*
  Warnings:

  - You are about to alter the column `afterDiscountValue` on the `vouchers` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "vouchers" ALTER COLUMN "afterDiscountValue" SET DATA TYPE INTEGER;
