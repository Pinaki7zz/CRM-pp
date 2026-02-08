/*
  Warnings:

  - The `purchaseOrder` column on the `SalesOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SalesOrder" DROP COLUMN "purchaseOrder",
ADD COLUMN     "purchaseOrder" DOUBLE PRECISION;
