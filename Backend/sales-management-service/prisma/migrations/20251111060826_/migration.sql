/*
  Warnings:

  - Made the column `primaryContactId` on table `Opportunity` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startDate` on table `Opportunity` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endDate` on table `Opportunity` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `Opportunity` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contactName` on table `Opportunity` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `name` to the `SalesQuote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Opportunity" ALTER COLUMN "primaryContactId" SET NOT NULL,
ALTER COLUMN "startDate" SET NOT NULL,
ALTER COLUMN "endDate" SET NOT NULL,
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "contactName" SET NOT NULL;

-- AlterTable
ALTER TABLE "SalesQuote" ADD COLUMN     "name" TEXT NOT NULL;
