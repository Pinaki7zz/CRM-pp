/*
  Warnings:

  - Made the column `primaryContactId` on table `SalesQuote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dueDate` on table `SalesQuote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `billingStreet` on table `SalesQuote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `billingCity` on table `SalesQuote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `billingState` on table `SalesQuote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `billingCountry` on table `SalesQuote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `billingPostalCode` on table `SalesQuote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shippingStreet` on table `SalesQuote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shippingCity` on table `SalesQuote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shippingState` on table `SalesQuote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shippingCountry` on table `SalesQuote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shippingPostalCode` on table `SalesQuote` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SalesQuote" ALTER COLUMN "primaryContactId" SET NOT NULL,
ALTER COLUMN "successRate" DROP NOT NULL,
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

-- AlterTable
ALTER TABLE "SalesQuoteItem" ALTER COLUMN "discount" DROP NOT NULL;
