/*
  Warnings:

  - You are about to drop the column `salesOfficeCode` on the `BusinessUnitSalesPair` table. All the data in the column will be lost.
  - You are about to drop the column `salesOfficeCode` on the `SalesChannelOfficeTeamPair` table. All the data in the column will be lost.
  - You are about to drop the column `salesOfficeCode` on the `SalesOffice` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[businessUnitCode,salesChannelCode,salesOfficeId,salesTeamCode]` on the table `BusinessUnitSalesPair` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[salesChannelCode,salesOfficeId,salesTeamCode]` on the table `SalesChannelOfficeTeamPair` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[salesOfficeId]` on the table `SalesOffice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `salesOfficeId` to the `BusinessUnitSalesPair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salesOfficeId` to the `SalesChannelOfficeTeamPair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salesOfficeId` to the `SalesOffice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BusinessUnitSalesPair" DROP CONSTRAINT "BusinessUnitSalesPair_salesOfficeCode_fkey";

-- DropForeignKey
ALTER TABLE "SalesChannelOfficeTeamPair" DROP CONSTRAINT "SalesChannelOfficeTeamPair_salesOfficeCode_fkey";

-- DropIndex
DROP INDEX "BusinessUnitSalesPair_businessUnitCode_salesChannelCode_sal_key";

-- DropIndex
DROP INDEX "SalesChannelOfficeTeamPair_salesChannelCode_salesOfficeCode_key";

-- DropIndex
DROP INDEX "SalesOffice_salesOfficeCode_key";

-- AlterTable
ALTER TABLE "BusinessUnitSalesPair" DROP COLUMN "salesOfficeCode",
ADD COLUMN     "salesOfficeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SalesChannelOfficeTeamPair" DROP COLUMN "salesOfficeCode",
ADD COLUMN     "salesOfficeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SalesOffice" DROP COLUMN "salesOfficeCode",
ADD COLUMN     "salesOfficeId" VARCHAR(4) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUnitSalesPair_businessUnitCode_salesChannelCode_sal_key" ON "BusinessUnitSalesPair"("businessUnitCode", "salesChannelCode", "salesOfficeId", "salesTeamCode");

-- CreateIndex
CREATE UNIQUE INDEX "SalesChannelOfficeTeamPair_salesChannelCode_salesOfficeId_s_key" ON "SalesChannelOfficeTeamPair"("salesChannelCode", "salesOfficeId", "salesTeamCode");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOffice_salesOfficeId_key" ON "SalesOffice"("salesOfficeId");

-- AddForeignKey
ALTER TABLE "SalesChannelOfficeTeamPair" ADD CONSTRAINT "SalesChannelOfficeTeamPair_salesOfficeId_fkey" FOREIGN KEY ("salesOfficeId") REFERENCES "SalesOffice"("salesOfficeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitSalesPair" ADD CONSTRAINT "BusinessUnitSalesPair_salesOfficeId_fkey" FOREIGN KEY ("salesOfficeId") REFERENCES "SalesOffice"("salesOfficeId") ON DELETE RESTRICT ON UPDATE CASCADE;
