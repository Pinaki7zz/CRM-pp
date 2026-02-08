/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `SalesOrder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `SalesQuote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `SalesOrder` table without a default value. This is not possible if the table is not empty.
  - Made the column `primaryContactId` on table `SalesOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dueDate` on table `SalesOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `billingStreet` on table `SalesOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `billingCity` on table `SalesOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `billingState` on table `SalesOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `billingCountry` on table `SalesOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `billingPostalCode` on table `SalesOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shippingStreet` on table `SalesOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shippingCity` on table `SalesOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shippingState` on table `SalesOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shippingCountry` on table `SalesOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shippingPostalCode` on table `SalesOrder` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SalesOrder" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "primaryContactId" SET NOT NULL,
ALTER COLUMN "dueDate" SET NOT NULL,
ALTER COLUMN "billingStreet" SET NOT NULL,
ALTER COLUMN "billingCity" SET NOT NULL,
ALTER COLUMN "billingState" SET NOT NULL,
ALTER COLUMN "billingCountry" SET NOT NULL,
ALTER COLUMN "billingPostalCode" SET NOT NULL,
ALTER COLUMN "shippingStreet" SET NOT NULL,
ALTER COLUMN "shippingCity" SET NOT NULL,
ALTER COLUMN "shippingState" SET NOT NULL,
ALTER COLUMN "shippingCountry" SET NOT NULL,
ALTER COLUMN "shippingPostalCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_name_key" ON "SalesOrder"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SalesQuote_name_key" ON "SalesQuote"("name");
