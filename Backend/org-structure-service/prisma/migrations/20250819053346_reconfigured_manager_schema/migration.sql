/*
  Warnings:

  - You are about to drop the column `marketingTeamCode` on the `MarketingTeamManager` table. All the data in the column will be lost.
  - You are about to drop the column `salesTeamCode` on the `SalesTeamManager` table. All the data in the column will be lost.
  - You are about to drop the column `serviceTeamCode` on the `ServiceTeamManager` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MarketingTeamManager" DROP CONSTRAINT "MarketingTeamManager_marketingTeamCode_fkey";

-- DropForeignKey
ALTER TABLE "SalesTeamManager" DROP CONSTRAINT "SalesTeamManager_salesTeamCode_fkey";

-- DropForeignKey
ALTER TABLE "ServiceTeamManager" DROP CONSTRAINT "ServiceTeamManager_serviceTeamCode_fkey";

-- AlterTable
ALTER TABLE "MarketingTeamManager" DROP COLUMN "marketingTeamCode";

-- AlterTable
ALTER TABLE "SalesTeamManager" DROP COLUMN "salesTeamCode";

-- AlterTable
ALTER TABLE "ServiceTeamManager" DROP COLUMN "serviceTeamCode";
