/*
  Warnings:

  - A unique constraint covering the columns `[categoryId]` on the table `ProductCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `ProductCategory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('MAIN', 'SUB');

-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "productAssignmentAllowed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "type" "CategoryType" NOT NULL DEFAULT 'MAIN';

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_categoryId_key" ON "ProductCategory"("categoryId");
