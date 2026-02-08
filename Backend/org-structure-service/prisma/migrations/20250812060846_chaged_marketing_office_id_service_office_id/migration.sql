/*
  Warnings:

  - You are about to drop the column `marketingOfficeCode` on the `BusinessUnitMarketingPair` table. All the data in the column will be lost.
  - You are about to drop the column `serviceOfficeCode` on the `BusinessUnitServicePair` table. All the data in the column will be lost.
  - You are about to drop the column `marketingOfficeCode` on the `MarketingChannelOfficeTeamPair` table. All the data in the column will be lost.
  - You are about to drop the column `marketingOfficeCode` on the `MarketingOffice` table. All the data in the column will be lost.
  - You are about to drop the column `serviceOfficeCode` on the `ServiceChannelOfficeTeamPair` table. All the data in the column will be lost.
  - You are about to drop the column `serviceOfficeCode` on the `ServiceOffice` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[businessUnitCode,marketingChannelCode,marketingOfficeId,marketingTeamCode]` on the table `BusinessUnitMarketingPair` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessUnitCode,serviceChannelCode,serviceOfficeId,serviceTeamCode]` on the table `BusinessUnitServicePair` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[marketingChannelCode,marketingOfficeId,marketingTeamCode]` on the table `MarketingChannelOfficeTeamPair` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[marketingOfficeId]` on the table `MarketingOffice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serviceChannelCode,serviceOfficeId,serviceTeamCode]` on the table `ServiceChannelOfficeTeamPair` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serviceOfficeId]` on the table `ServiceOffice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `marketingOfficeId` to the `BusinessUnitMarketingPair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceOfficeId` to the `BusinessUnitServicePair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marketingOfficeId` to the `MarketingChannelOfficeTeamPair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marketingOfficeId` to the `MarketingOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceOfficeId` to the `ServiceChannelOfficeTeamPair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceOfficeId` to the `ServiceOffice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BusinessUnitMarketingPair" DROP CONSTRAINT "BusinessUnitMarketingPair_marketingOfficeCode_fkey";

-- DropForeignKey
ALTER TABLE "BusinessUnitServicePair" DROP CONSTRAINT "BusinessUnitServicePair_serviceOfficeCode_fkey";

-- DropForeignKey
ALTER TABLE "MarketingChannelOfficeTeamPair" DROP CONSTRAINT "MarketingChannelOfficeTeamPair_marketingOfficeCode_fkey";

-- DropForeignKey
ALTER TABLE "ServiceChannelOfficeTeamPair" DROP CONSTRAINT "ServiceChannelOfficeTeamPair_serviceOfficeCode_fkey";

-- DropIndex
DROP INDEX "BusinessUnitMarketingPair_businessUnitCode_marketingChannel_key";

-- DropIndex
DROP INDEX "BusinessUnitServicePair_businessUnitCode_serviceChannelCode_key";

-- DropIndex
DROP INDEX "MarketingChannelOfficeTeamPair_marketingChannelCode_marketi_key";

-- DropIndex
DROP INDEX "MarketingOffice_marketingOfficeCode_key";

-- DropIndex
DROP INDEX "ServiceChannelOfficeTeamPair_serviceChannelCode_serviceOffi_key";

-- DropIndex
DROP INDEX "ServiceOffice_serviceOfficeCode_key";

-- AlterTable
ALTER TABLE "BusinessUnitMarketingPair" DROP COLUMN "marketingOfficeCode",
ADD COLUMN     "marketingOfficeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BusinessUnitServicePair" DROP COLUMN "serviceOfficeCode",
ADD COLUMN     "serviceOfficeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MarketingChannelOfficeTeamPair" DROP COLUMN "marketingOfficeCode",
ADD COLUMN     "marketingOfficeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MarketingOffice" DROP COLUMN "marketingOfficeCode",
ADD COLUMN     "marketingOfficeId" VARCHAR(4) NOT NULL;

-- AlterTable
ALTER TABLE "ServiceChannelOfficeTeamPair" DROP COLUMN "serviceOfficeCode",
ADD COLUMN     "serviceOfficeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServiceOffice" DROP COLUMN "serviceOfficeCode",
ADD COLUMN     "serviceOfficeId" VARCHAR(4) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUnitMarketingPair_businessUnitCode_marketingChannel_key" ON "BusinessUnitMarketingPair"("businessUnitCode", "marketingChannelCode", "marketingOfficeId", "marketingTeamCode");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUnitServicePair_businessUnitCode_serviceChannelCode_key" ON "BusinessUnitServicePair"("businessUnitCode", "serviceChannelCode", "serviceOfficeId", "serviceTeamCode");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingChannelOfficeTeamPair_marketingChannelCode_marketi_key" ON "MarketingChannelOfficeTeamPair"("marketingChannelCode", "marketingOfficeId", "marketingTeamCode");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingOffice_marketingOfficeId_key" ON "MarketingOffice"("marketingOfficeId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceChannelOfficeTeamPair_serviceChannelCode_serviceOffi_key" ON "ServiceChannelOfficeTeamPair"("serviceChannelCode", "serviceOfficeId", "serviceTeamCode");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOffice_serviceOfficeId_key" ON "ServiceOffice"("serviceOfficeId");

-- AddForeignKey
ALTER TABLE "MarketingChannelOfficeTeamPair" ADD CONSTRAINT "MarketingChannelOfficeTeamPair_marketingOfficeId_fkey" FOREIGN KEY ("marketingOfficeId") REFERENCES "MarketingOffice"("marketingOfficeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceChannelOfficeTeamPair" ADD CONSTRAINT "ServiceChannelOfficeTeamPair_serviceOfficeId_fkey" FOREIGN KEY ("serviceOfficeId") REFERENCES "ServiceOffice"("serviceOfficeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitMarketingPair" ADD CONSTRAINT "BusinessUnitMarketingPair_marketingOfficeId_fkey" FOREIGN KEY ("marketingOfficeId") REFERENCES "MarketingOffice"("marketingOfficeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitServicePair" ADD CONSTRAINT "BusinessUnitServicePair_serviceOfficeId_fkey" FOREIGN KEY ("serviceOfficeId") REFERENCES "ServiceOffice"("serviceOfficeId") ON DELETE RESTRICT ON UPDATE CASCADE;
