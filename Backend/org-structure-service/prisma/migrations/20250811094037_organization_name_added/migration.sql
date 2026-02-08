/*
  Warnings:

  - Added the required column `organizationName` to the `SalesOffice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SalesOffice" ADD COLUMN     "organizationName" VARCHAR(30) NOT NULL,
ALTER COLUMN "salesOfficeDesc" DROP NOT NULL,
ALTER COLUMN "salesOfficeDesc" SET DATA TYPE VARCHAR(50);
