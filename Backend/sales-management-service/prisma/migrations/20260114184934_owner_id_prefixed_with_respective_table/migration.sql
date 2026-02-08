/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Opportunity` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `SalesOrder` table. All the data in the column will be lost.
  - Added the required column `opportunityOwnerId` to the `Opportunity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderOwnerId` to the `SalesOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Opportunity" DROP COLUMN "ownerId",
ADD COLUMN     "opportunityOwnerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SalesOrder" DROP COLUMN "ownerId",
ADD COLUMN     "orderOwnerId" TEXT NOT NULL;
